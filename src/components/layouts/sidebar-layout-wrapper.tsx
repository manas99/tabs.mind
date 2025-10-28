import { useState, type ReactNode, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../logo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faXmark,
    faChartPie,
    faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarLayoutProps {
    children: ReactNode;
    title: string;
}

function AppHeader({
    onSidebarToggleAction,
    isSidebarOpen,
    title,
}: {
    onSidebarToggleAction: () => void;
    isSidebarOpen: boolean;
    title: string;
}) {
    return (
        <header className="fixed top-0 left-0 w-full h-14 bg-[#0d0d12]/90 backdrop-blur-lg border-b border-neutral-800 flex items-center px-4 sm:px-6 z-30">
            <button
                onClick={onSidebarToggleAction}
                className="sm:hidden text-neutral-400 hover:text-neutral-200"
            >
                <FontAwesomeIcon icon={isSidebarOpen ? faXmark : faBars} />
            </button>

            <h1 className="ml-3 sm:ml-0 text-lg tracking-wide text-neutral-100">
                {title}
            </h1>
        </header>
    );
}

function AppSidebar({
    isOpen,
    onToggleAction,
}: {
    isOpen: boolean;
    onToggleAction: () => void;
}) {
    return (
        <aside
            className={`fixed top-0 left-0 h-full w-56 shrink-0 border-r border-neutral-800  flex flex-col bg-[#0d0d12] z-40 transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            sm:translate-x-0 sm:static`}
        >
            <div className="flex justify-between items-center h-14">
                <div className="px-3">
                    <Logo />
                </div>
                <button
                    className="sm:hidden text-neutral-400 hover:text-neutral-200 px-3"
                    onClick={onToggleAction}
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>
            </div>

            <nav className="flex flex-col gap-2 pt-5 px-2">
                <SidebarLink
                    to="/"
                    icon={faChartPie}
                    label="Dashboard"
                    onClick={onToggleAction}
                />
                <SidebarLink
                    to="/sessions"
                    icon={faFolderOpen}
                    label="Sessions"
                    onClick={onToggleAction}
                />
            </nav>

            <div className="mt-auto mx-auto text-xs text-neutral-500 p-4">
                tabs.mind © {new Date().getFullYear()}
            </div>
        </aside>
    );
}

function SidebarLink({
    to,
    icon,
    label,
    onClick,
}: {
    to: string;
    icon: any;
    label: string;
    onClick?: () => void;
}) {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `flex items-center gap-3 text-sm px-3 py-2 rounded-lg hover:bg-neutral-800 transition ${
                    isActive ? "bg-neutral-800 text-brand-500" : ""
                }`
            }
            onClick={onClick}
        >
            <FontAwesomeIcon icon={icon} />
            {label}
        </NavLink>
    );
}

export function SidebarLayout({ children, title }: SidebarLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const onSidebarToggle = () => setSidebarOpen((p) => !p);

    return (
        <div className="flex h-screen bg-linear-to-br from-[#0d0d12] via-[#11121a] to-[#0d0d12] text-neutral-100">
            <AppSidebar
                isOpen={isSidebarOpen}
                onToggleAction={onSidebarToggle}
            />
            <div className="flex flex-col grow transform-gpu transition">
                <AppHeader
                    onSidebarToggleAction={onSidebarToggle}
                    isSidebarOpen={isSidebarOpen}
                    title={title}
                />

                <main
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden mt-14 p-4"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
