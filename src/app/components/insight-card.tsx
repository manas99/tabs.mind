import React from "react";

interface InsightCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
}

export function InsightCard({
    title,
    value,
    subtitle,
    icon,
}: InsightCardProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md p-2 sm:p-3 text-center shadow-md hover:shadow-brand-500/20 hover:border-brand-600 transition-all duration-200">
            {icon && <div className="mb-2 text-brand-500 text-lg">{icon}</div>}
            <div className="text-sm text-neutral-400 font-medium">{title}</div>
            <h3 className="text-2xl sm:text-3xl font-display font-semibold text-brand-500 mt-4">
                {value}
            </h3>
            {subtitle && (
                <div className="text-xs text-neutral-500 mt-1">{subtitle}</div>
            )}
        </div>
    );
}
