import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface AccordionProps {
    title: string;
    defaultOpen?: boolean;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export function Accordion({
    title,
    defaultOpen = false,
    actions,
    children,
}: AccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="mb-3 py-3 px-4 border-b border-neutral-800">
            <div
                className="flex items-center justify-between cursor-pointer pb-2 group"
                onClick={() => setOpen(!open)}
            >
                <h3 className="text-lg font-semibold text-neutral-100 grow">
                    {title}
                </h3>

                <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {actions}
                </div>
                <div className="px-4">
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-xs text-neutral-500 transition-transform duration-200 ${
                            open ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </div>

            <div
                className={`transition-all duration-300 ${
                    open ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
            >
                <div className="mt-2 mb-6">{children}</div>
            </div>
        </div>
    );
}
