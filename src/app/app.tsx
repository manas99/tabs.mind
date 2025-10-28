import { Routes, Route, useNavigate } from "react-router-dom";

import { AiService } from "../libs/ai";
import { useEffect, useState } from "react";
import { InstallPage } from "./pages/install";
import { SessionsListPage } from "./pages/session-list";
import { SessionDetailPage } from "./pages/session-detail";
import { NotFound } from "./pages/not-found";
import { SidebarLayout } from "../components/layouts/sidebar-layout-wrapper";
import { Home } from "./pages/home";
import { Loading } from "../components/loading";

export function App() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        AiService.Instance.checkModels().then((m) => {
            const ready = m.every((x) => x.availability === "available");
            setLoading(false);

            if (!ready && location.pathname !== "/install") {
                navigate("/install", { replace: true });
            }
        });
    }, []);

    if (loading) return <Loading />;

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <SidebarLayout title={"Dashboard"}>
                        <Home />
                    </SidebarLayout>
                }
            />
            <Route path="/install" element={<InstallPage />} />
            <Route
                path="/sessions"
                element={
                    <SidebarLayout title="Sessions">
                        <SessionsListPage />
                    </SidebarLayout>
                }
            />
            <Route
                path="/sessions/:id"
                element={
                    <SidebarLayout title="Sessions">
                        <SessionDetailPage />
                    </SidebarLayout>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
