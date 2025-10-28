export function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div className="text-xl text-brand-500 mb-2">{title}</div>
            <div className="text-sm text-neutral-400 max-w-md">
                {description}
            </div>
        </div>
    );
}
