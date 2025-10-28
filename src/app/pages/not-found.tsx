import { FullPageWrapper } from "../../components/layouts/full-page-wrapper";

export function NotFound() {
    return (
        <FullPageWrapper showHomeButton={true}>
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl">Page not found.</h1>
            </div>
        </FullPageWrapper>
    );
}
