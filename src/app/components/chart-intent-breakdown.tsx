import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card } from "../../components/card";

const COLORS = ["#7b61ff", "#4ade80", "#60a5fa", "#facc15", "#f472b6"];

export function ChartIntentBreakdown({
    data,
}: {
    data: Record<string, number>;
}) {
    const chartData = Object.entries(data).map(([name, value]) => ({
        name,
        value,
    }));
    return (
        <Card>
            <h2 className="text-lg mb-2">Intent Breakdown</h2>
            {chartData.length === 0 ? (
                <div className="text-sm text-neutral-500">No data yet.</div>
            ) : (
                <PieChart width={280} height={220}>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                    >
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            )}
        </Card>
    );
}
