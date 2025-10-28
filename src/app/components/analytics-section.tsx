import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";
import { type Page } from "../../libs/db";
import { Card } from "../../components/card";
import { InsightCard } from "./insight-card";

const COLORS = [
    "#7b61ff",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#ff6b6b",
];

export function AnalyticsSection({ pages }: { pages: Page[] }) {
    if (!pages.length)
        return (
            <div className="text-neutral-400 text-sm">
                Not enough data to display analytics yet.
            </div>
        );

    const intentData = Object.entries(
        pages.reduce(
            (acc, p) => {
                if (p.intent) acc[p.intent] = (acc[p.intent] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        ),
    ).map(([intent, count]) => ({ name: intent, value: count }));

    const domainData = Object.entries(
        pages.reduce(
            (acc, p) => {
                const domain = p.domain || "Unknown";
                acc[domain] = (acc[domain] || 0) + (p.timeSpent || 0);
                return acc;
            },
            {} as Record<string, number>,
        ),
    )
        .map(([domain, timeSpent]) => ({
            domain,
            minutes: (timeSpent / 60).toFixed(1),
        }))
        .sort((a, b) => Number(b.minutes) - Number(a.minutes))
        .slice(0, 5);

    const totalTime =
        pages.reduce((acc, p) => acc + (p.timeSpent || 0), 0) / 60;
    const topIntent =
        Object.entries(
            pages.reduce(
                (acc, p) => {
                    if (p.intent) acc[p.intent] = (acc[p.intent] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>,
            ),
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InsightCard title="Total Pages" value={pages.length} />
                <InsightCard title="Top Intent" value={topIntent} />
                <InsightCard
                    title="Total Time"
                    value={`${totalTime.toFixed(1)} min`}
                />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <Card title="Intent Distribution">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={intentData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                                fill="#8884d8"
                                label
                            >
                                {intentData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#ffffff",
                                    border: "none",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Top Domains by Time Spent">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={domainData}>
                            <XAxis
                                dataKey="domain"
                                stroke="#aaa"
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis stroke="#aaa" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1a1a1a",
                                    border: "none",
                                }}
                            />
                            <Bar dataKey="minutes" fill="#7b61ff" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="mt-4 text-sm text-neutral-400 italic">
                Most of your time was spent on{" "}
                <span className="text-brand-500 font-medium">
                    {domainData[0]?.domain || "—"}
                </span>
                , mainly for{" "}
                <span className="text-brand-500 font-medium">
                    {intentData.sort((a, b) => b.value - a.value)[0]?.name ||
                        "general"}
                </span>{" "}
                activity.
            </div>
        </div>
    );
}
