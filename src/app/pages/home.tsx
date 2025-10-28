import { useEffect, useState, useMemo } from "react";
import { db } from "../../libs/db";
import { InsightCard } from "../components/insight-card";
import { EmptyState } from "../../components/empty-state";
import { ChartIntentBreakdown } from "../components/chart-intent-breakdown";
import { ChartTopDomains } from "../components/chart-top-domains";

export function Home() {
    const [pages, setPages] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [p, s] = await Promise.all([
                db.pages.toArray(),
                db.sessions.toArray(),
            ]);
            setPages(p);
            setSessions(s);
            setLoading(false);
        })();
    }, []);

    const intentCounts = useMemo(() => {
        const acc: Record<string, number> = {};
        for (const p of pages) {
            if (p.intent) acc[p.intent] = (acc[p.intent] || 0) + 1;
        }
        return acc;
    }, [pages]);

    const domainCounts = useMemo(() => {
        const acc: Record<string, number> = {};
        for (const p of pages) {
            acc[p.domain] = (acc[p.domain] || 0) + 1;
        }
        return acc;
    }, [pages]);

    const totalSessions = sessions.length;
    const totalPages = pages.length;

    const avgPagesPerSession =
        totalSessions > 0 ? Math.round(totalPages / totalSessions) : 0;

    if (loading)
        return (
            <div className="flex items-center justify-center h-64 text-neutral-400">
                Loading your insights...
            </div>
        );

    if (pages.length === 0 && sessions.length === 0)
        return (
            <EmptyState
                title="No Data Yet"
                description="Start your first research session to explore your web activity and AI insights here."
            />
        );

    return (
        <div className="space-y-8 fade-in">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-2">
                    Your Week on the Web
                </h1>
                <p className="text-sm text-neutral-400">
                    Summarized insights from your browsing sessions powered by
                    on-device AI.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard
                    title="Total Pages Captured"
                    value={totalPages}
                    subtitle="Unique web pages recorded during sessions"
                />
                <InsightCard
                    title="Total Sessions"
                    value={totalSessions}
                    subtitle="Completed or paused research sessions"
                />
                <InsightCard
                    title="Avg. Pages / Session"
                    value={avgPagesPerSession}
                    subtitle="Engagement depth across sessions"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <ChartIntentBreakdown data={intentCounts} />
                <ChartTopDomains data={domainCounts} />
            </div>
        </div>
    );
}
