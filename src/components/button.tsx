import { type ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps {
    onClick?: () => void;
    children: ReactNode;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
    icon?: ReactNode;
}

export function Button({
    onClick,
    children,
    disabled = false,
    variant = "primary",
    size = "md",
    className,
    icon,
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 ease-in-out disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-brand-600 hover:bg-brand-500 text-white disabled:bg-brand-800 disabled:text-neutral-400",
        secondary:
            "bg-neutral-800 hover:bg-neutral-700 text-neutral-100 disabled:bg-neutral-900 disabled:text-neutral-500",
        ghost: "text-brand-500 hover:text-brand-400 disabled:text-neutral-600 disabled:opacity-60",
        danger: "bg-red-600 hover:bg-red-500 text-white disabled:bg-red-900 disabled:text-neutral-400",
    };

    const sizes = {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-5 py-2.5",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(base, variants[variant], sizes[size], className)}
        >
            {icon && <span className="text-sm">{icon}</span>}
            {children}
        </button>
    );
}
