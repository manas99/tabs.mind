export function Loading({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-20 text-neutral-400">
            <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">{text}</p>
        </div>
    );
}
