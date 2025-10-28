import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    widthClass?: string;
    disableBackdropClose?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    widthClass = "max-w-lg",
    disableBackdropClose = false,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={!disableBackdropClose ? onClose : undefined}
        >
            <div
                className={`bg-neutral-900 border border-neutral-700 rounded-xl p-4 shadow-2xl w-full ${widthClass} mx-4 relative text-neutral-100`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-lg font-semibold text-neutral-100">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-neutral-400 hover:text-neutral-200 transition"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="max-h-[70vh] overflow-y-auto space-y-4 p-2">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}
