export function Card({ title, subtitle, children }: any) {
    return (
        <div className="rounded-xl border border-neutral-800 dark:border-neutral-700 bg-white/5 dark:bg-neutral-900/80 p-4 backdrop-blur-sm hover:border-brand-500 transition">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-neutral-100">{title}</h3>
                {subtitle && (
                    <span className="text-xs text-neutral-500">{subtitle}</span>
                )}
            </div>
            <div className="mt-2 text-sm text-neutral-300">{children}</div>
        </div>
    );
}
