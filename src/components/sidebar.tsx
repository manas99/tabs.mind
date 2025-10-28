import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    widthClass?: string;
    disableBackdropClose?: boolean;
}

export function Sidebar({ isOpen, onClose, title, children }: SidebarProps) {
    if (!isOpen) return null;

    return createPortal(
        <div
            className={`fixed top-0 right-0 h-full w-[320px] bg-neutral-950 border-l border-neutral-800 shadow-lg z-40
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0 opacity-100" : "translate-x-[320px] opacity-0"}
            ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
        >
            <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-800">
                <h2 className="text-lg">{title}</h2>
                <button
                    onClick={() => onClose()}
                    className="text-neutral-500 hover:text-white transition"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
            <div className="p-3 overflow-y-auto h-[calc(100%-60px)]">
                {children}
            </div>
        </div>,
        document.body,
    );
}
