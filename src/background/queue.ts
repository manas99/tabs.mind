type QueueJob = () => Promise<void>;

// TODO: add persistent storage and resume
export class BackgroundQueue {
    private static instance: BackgroundQueue;
    private queue: QueueJob[] = [];
    private running = false;

    private constructor() {}

    static get Instance() {
        if (!this.instance) this.instance = new BackgroundQueue();
        return this.instance;
    }

    enqueue(job: QueueJob) {
        this.queue.push(job);
        this.process();
    }

    private async process() {
        if (this.running) return;
        this.running = true;

        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (!job) continue;

            try {
                await job();
            } catch (err) {
                console.log("quota", {
                    quota: (err as any)?.quota,
                    requested: (err as any)?.requested,
                });
                console.error("Queue job failed:", err);
            }
        }

        this.running = false;
    }
}
