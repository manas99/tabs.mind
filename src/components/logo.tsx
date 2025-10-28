import logo512 from "@/assets/icons/icon512.png";

interface LogoProps {
    size?: "sm" | "lg";
    showText?: boolean;
    className?: string;
}

export function Logo({
    size = "lg",
    showText = true,
    className = "",
}: LogoProps) {
    const isSmall = size === "sm";

    return (
        <div
            className={`flex items-center gap-2 select-none ${className}`}
            style={{
                transform: isSmall ? "scale(0.85)" : "scale(1)",
            }}
        >
            <img
                src={logo512}
                alt="tabs.mind logo"
                className={`${isSmall ? "w-4 h-4" : "w-8 h-8"} rounded-md`}
            />
            {showText && (
                <span
                    className={`font-display ${
                        isSmall ? "text-base" : "text-2xl"
                    } font-semibold tracking-tight`}
                >
                    <span className="text-white">tabs</span>
                    <span className="text-brand-500">.mind</span>
                </span>
            )}
        </div>
    );
}
