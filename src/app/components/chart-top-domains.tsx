import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card } from "../../components/card";

export function ChartTopDomains({ data }: { data: Record<string, number> }) {
    const chartData = Object.entries(data)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <Card>
            <h2 className="text-lg mb-2">Top Domains</h2>
            {chartData.length === 0 ? (
                <div className="text-sm text-neutral-500">No data yet.</div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="domain"
                            tick={{ fill: "#999", fontSize: 12 }}
                        />
                        <YAxis hide />
                        <Tooltip />
                        <Bar
                            dataKey="count"
                            fill="#7b61ff"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}
