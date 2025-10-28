import { Logo } from "../logo";

export function FullPageWrapper({
    children,
    showHomeButton = true,
}: {
    children: any;
    showHomeButton: boolean;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-neutral-400 gap-12">
            <div className="">
                <Logo />
            </div>
            <div>{children}</div>
            {showHomeButton && (
                <div>
                    <a
                        href="#/sessions"
                        className="text-brand-400 mt-2 hover:underline text-sm"
                    >
                        Back home
                    </a>
                </div>
            )}
        </div>
    );
}
