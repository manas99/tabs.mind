import Dexie from "dexie";
import { db, type Session, type Page } from "./db";
import { AiService } from "./ai";
import { sendMessage } from "./chrome";
import { cleanMarkdown } from "./helpers";

export class SessionService {
    static async active(): Promise<Session | undefined> {
        return await db.sessions.where({ state: "running" }).first();
    }

    static async isActive(): Promise<boolean> {
        return !!(await this.active());
    }

    static async current(): Promise<Session | undefined> {
        return await db.sessions
            .filter((s) => s.state === "running" || s.state === "paused")
            .first();
    }

    static async start(title?: string): Promise<Session | null> {
        const active = await db.sessions.where({ state: "running" }).toArray();
        if (active.length) {
            alert("Session already active.");
            return null;
        }
        const session: Session = {
            title: title || `Session ${new Date().toLocaleString()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            state: "running",
        };
        const id = await db.sessions.add(session);
        return { ...session, id };
    }

    static async pause() {
        const active = await this.active();
        if (!active || !active?.id) {
            return alert("Session not found.");
        }
        if (active.state != "running") {
            return alert("Cannot stop an idle session");
        }
        await db.sessions.update(active.id, {
            state: "paused",
            updatedAt: new Date(),
        });
    }

    static async stop() {
        const current = await this.current();
        if (!current || !current.id) {
            return alert("Session not found.");
        }
        if (current.state == "stopped") {
            return alert("Session already stopped");
        }
        const teasers = await db.pages
            .where("[sessionId+timeSpent]")
            .between([current.id, Dexie.minKey], [current.id, Dexie.maxKey])
            .keys((keys) =>
                keys.map((key) => ({
                    timeSpent: (key as Array<any>)[1],
                })),
            );
        const totalTimeSpent = teasers.reduce(
            (acc, row) => acc + (row?.timeSpent || 0),
            0,
        );

        const payload: any = {
            state: "stopped",
            updatedAt: new Date(),
            timeSpent: totalTimeSpent,
        };

        await db.sessions.update(current.id, payload);
        await sendMessage("SESSION_GENERATE_REPORT", { sessionId: current.id });
        return current.id;
    }

    static async delete(id: number) {
        await db.reports.where("sessionId").equals(id).delete();
        const pageIds = await db.pages
            .where("sessionId")
            .equals(id)
            .primaryKeys();
        await db.suggestions.where("pageId").anyOf(pageIds).delete();
        await db.pages.where("sessionId").equals(id).delete();
        await db.sessions.delete(id);
    }

    static async get(sessionId: number) {
        return await db.sessions.get(sessionId);
    }

    static async startReport(sessionId: number) {
        await db.sessions.update(sessionId, { isReportGenerating: true });
    }

    static async addPage(data: Omit<Page, "id">): Promise<null | number> {
        const active = await this.active();
        if (!active || !active?.id) {
            return null;
        }
        const page: Page = {
            ...data,
            sessionId: active.id,
            createdAt: new Date(),
        };
        const pageId = await db.pages.add(page);
        await db.sessions.update(page.sessionId, { updatedAt: new Date() });
        const reportIds = await db.reports
            .where("sessionId")
            .equals(page.sessionId)
            .primaryKeys();
        await db.reports.bulkUpdate(
            reportIds.map((id) => ({ key: id, changes: { isOutdated: true } })),
        );
        return pageId;
    }

    static async deletePage(pageId: number) {
        const page = await db.pages.get(pageId);
        if (!page) return;

        await db.suggestions.where("pageId").equals(pageId).delete();
        await db.pages.where("id").equals(pageId).delete();
        await db.sessions.update(page.sessionId, {
            updatedAt: new Date(),
        });
        const reportIds = await db.reports
            .where("sessionId")
            .equals(page.sessionId)
            .primaryKeys();
        await db.reports.bulkUpdate(
            reportIds.map((id) => ({ key: id, changes: { isOutdated: true } })),
        );
    }

    static async generateReport(sessionId: number) {
        let reportId: number | null = null;
        try {
            console.log("started report generation");
            const session = await db.sessions.get(sessionId);
            if (!session) {
                return;
            }
            await db.sessions.update(sessionId, { isReportGenerating: true });
            const pages = await db.pages
                .where("sessionId")
                .equals(sessionId)
                .toArray();

            console.log("pages fetch", pages);

            if (pages.length == 0) {
                return await db.reports.add({
                    sessionId,
                    report: "Not enough browsing done to generate a report.",
                    createdAt: new Date(),
                });
            }

            console.log("after pages fetch", pages);

            const teasers = pages
                .filter((p) => !!p.teaser)
                .map((p) => p.teaser);
            let headline: undefined | string;
            if (teasers.length) {
                headline = await AiService.Instance.getHeaderForSession(
                    teasers as string[],
                );
            }

            console.log("teasers", teasers.length);

            const chunkSummaries = await this.chunkSummaries(pages);

            const report = await AiService.Instance.sessionReport(
                session,
                chunkSummaries,
            );
            const cleaned = cleanMarkdown(report);

            console.log("cleaned", cleaned);
            reportId = await db.reports.add({
                sessionId,
                report: cleaned,
                createdAt: new Date(),
            });

            let sessionPayload: any = { isReportGenerating: false };
            if (headline) {
                sessionPayload = { ...sessionPayload, title: headline };
            }
            await db.sessions.update(sessionId, sessionPayload);
            console.log("Completed report generation");
        } catch (err) {
            if (reportId) {
                await db.reports.update(reportId, {
                    sessionId,
                    report: JSON.stringify({
                        report: `An error occurred while generating the report - ${err}`,
                        suggestions: "An error occurred",
                        questions: [],
                    }),
                    createdAt: new Date(),
                });
            }
            await db.sessions.update(sessionId, { isReportGenerating: false });
        }
    }

    private static async chunkSummaries(pages: Page[]) {
        const chunkSize = 5; // process 5 pages at a time
        const partialSummaries: string[] = [];

        for (let i = 0; i < pages.length; i += chunkSize) {
            const batch = pages.slice(i, i + chunkSize);
            const partial = await AiService.Instance.pageChunkSummaries(batch);
            partialSummaries.push(partial);
        }
        return partialSummaries;
    }
}
