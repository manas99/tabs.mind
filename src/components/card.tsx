import clsx from "clsx";
import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
}

export function Card({ title, subtitle, children, className = "" }: CardProps) {
    return (
        <div
            className={clsx(
                "rounded-xl border border-neutral-800 dark:border-neutral-700 bg-white/5 dark:bg-neutral-900/80 p-4 backdrop-blur-sm hover:border-brand-500 transition",
                className,
            )}
        >
            {title && (
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-neutral-100">{title}</h3>
                    {subtitle && (
                        <span className="text-xs text-neutral-500">
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
            <div
                className={clsx("text-sm text-neutral-300", {
                    "mt-2": !!title,
                })}
            >
                {children}
            </div>
        </div>
    );
}
