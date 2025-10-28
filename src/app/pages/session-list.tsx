import { useEffect, useState } from "react";
import { db } from "../../libs/db";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/empty-state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleRight,
    faCheck,
    faPause,
} from "@fortawesome/free-solid-svg-icons";
import { Loading } from "../../components/loading";
import { Card } from "../../components/card";

export function SessionsListPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const data = await db.sessions.reverse().toArray();
            setSessions(data);
            setLoading(false);
        })();
    }, []);

    if (loading) return <Loading />;
    if (sessions.length === 0)
        return (
            <EmptyState
                title="No Sessions"
                description="Start your first research session."
            />
        );

    return (
        <div className="space-y-4 fade-in">
            {sessions.map((s) => (
                <Link key={s.id} to={`/sessions/${s.id}`}>
                    <Card className="mb-4">
                        <div className="flex gap-3">
                            <div className="">
                                {s.state === "running" && (
                                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                )}
                                {s.state === "paused" && (
                                    <span className="h-2 w-2">
                                        <FontAwesomeIcon icon={faPause} />
                                    </span>
                                )}
                                {s.state === "stopped" && (
                                    <span className="h-2 w-2">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </span>
                                )}
                            </div>
                            <div className="font-medium grow">
                                <div>{s.title || "Untitled Session"}</div>
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faAngleRight} />
                            </div>
                        </div>
                        <div className="text-xs text-neutral-400 mt-2">
                            {new Date(s.createdAt).toLocaleString()}
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
