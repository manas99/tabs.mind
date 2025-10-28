import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    db,
    type Page,
    type Suggestion,
    type ReportQuestions,
} from "../../libs/db";
import { EmptyState } from "../../components/empty-state";
import { Markdown } from "../../components/markdown";
import { Modal } from "../../components/modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRotateRight,
    faClockRotateLeft,
    faLink,
    faEyeSlash,
    faEye,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import { sendMessage } from "../../libs/chrome";
import { Loading } from "../../components/loading";
import { Button } from "../../components/button";
import { Sidebar } from "../../components/sidebar";
import { Accordion } from "../../components/accordion";
import { AnalyticsSection } from "../components/analytics-section";

export function SessionDetailPage() {
    const { id } = useParams();
    const sessionId = Number(id);
    const [pages, setPages] = useState<Page[]>([]);
    const [session, setSession] = useState<any>(null);
    const [reportMarkdown, setReportMarkdown] = useState<any>(null);
    const [reportSuggestions, setReportSuggestions] = useState<any>(null);
    const [questions, setQuestions] = useState<ReportQuestions[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const loadPages = useCallback(async () => {
        const data = await db.pages
            .where("sessionId")
            .equals(sessionId)
            .reverse()
            .toArray();
        setPages(data);
        setLoading(false);
    }, [sessionId]);

    const loadSession = useCallback(async () => {
        const s = await db.sessions.get(sessionId);
        const r = await db.reports
            .where("sessionId")
            .equals(sessionId)
            .reverse()
            .first();
        setIsRegenerating(s?.isReportGenerating || false);
        const _report = JSON.parse(r?.report || "{}");
        console.log(_report);
        setReportMarkdown(_report.report);
        setReportSuggestions(_report.suggestions);
        setQuestions(_report.questions);
        setSession(s);
        setLoading(false);
    }, [sessionId]);

    const loadSuggestions = useCallback(async (pageId: number) => {
        const list = await db.suggestions
            .where("pageId")
            .equals(pageId)
            .toArray();
        setSuggestions(list);
    }, []);

    const regenerateReport = async () => {
        setIsRegenerating(true);
        await sendMessage("SESSION_GENERATE_REPORT", { sessionId });
        await loadSession();
    };

    useEffect(() => {
        if (!session?.isReportGenerating) return;
        const interval = setInterval(async () => {
            await loadSession();
        }, 5000);
        return () => clearInterval(interval);
    }, [session?.isReportGenerating, loadSession]);

    useEffect(() => {
        loadPages();
        loadSession();
    }, [loadPages, loadSession]);

    useEffect(() => {
        if (selectedPage?.id) loadSuggestions(selectedPage.id);
        else setSuggestions([]);
    }, [selectedPage, loadSuggestions]);

    if (loading) return <Loading />;
    if (pages.length === 0)
        return (
            <EmptyState
                title="No Pages"
                description="No pages recorded for this session."
            />
        );

    return (
        <div className="relative fade-in overflow-x-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                    {session?.title || "Session Details"}
                </h2>
                <Button
                    variant="ghost"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm text-neutral-400 hover:text-brand-400 transition"
                >
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                    {showHistory ? "Hide History" : "Show History"}
                </Button>
            </div>

            <div
                className={`transition-all duration-300 ${showHistory ? "lg:pr-[340px]" : ""}`}
            >
                <Accordion title="Analytics & Metrics" defaultOpen>
                    <AnalyticsSection pages={pages} />
                </Accordion>

                <Accordion
                    title="Session Report"
                    actions={
                        <Button
                            variant="ghost"
                            onClick={regenerateReport}
                            className="flex items-center gap-2 text-xs text-brand-500 hover:text-brand-400 transition"
                            disabled={false}
                        >
                            <FontAwesomeIcon icon={faRotateRight} />
                            Regenerate
                        </Button>
                    }
                >
                    {isRegenerating ? (
                        <Loading text="Report is being generated..." />
                    ) : (
                        <div className="px-3 py-2">
                            <Markdown
                                content={
                                    reportMarkdown ||
                                    "Report will appear here once generated."
                                }
                            />
                        </div>
                    )}
                </Accordion>
                <Accordion title="Suggestions and next steps">
                    {isRegenerating ? (
                        <Loading text="Suggestions are being generated..." />
                    ) : (
                        <div className="px-3 py-2">
                            <Markdown
                                content={
                                    reportSuggestions ||
                                    "Suggestions will appear here once generated."
                                }
                            />
                        </div>
                    )}
                </Accordion>

                <Accordion title="Questions & Answers">
                    {!questions?.length ? (
                        <div className="text-neutral-400 text-sm">
                            No questions available for this session.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((q) => (
                                <QuestionItem
                                    key={q.id}
                                    question={q.question}
                                    answer={q.answer}
                                />
                            ))}
                        </div>
                    )}
                </Accordion>
            </div>

            <Sidebar
                title="History"
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            >
                {pages.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => setSelectedPage(p)}
                        className="group p-2 rounded-lg hover:bg-neutral-800 transition cursor-pointer mb-1"
                    >
                        <div className="flex items-center gap-2">
                            {p.favicon ? (
                                <img
                                    src={p.favicon}
                                    alt=""
                                    className="w-4 h-4 rounded-sm"
                                />
                            ) : (
                                <div className="w-4 h-4 bg-neutral-700 rounded-sm"></div>
                            )}
                            <span className="truncate text-sm text-neutral-200">
                                {p.title || "(Untitled)"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-500 mt-1 ml-6">
                            <span className="truncate">
                                {p.domain.replace(/^www\./, "")}
                            </span>
                            <span className="flex items-center gap-2">
                                {p.timeSpent
                                    ? `${Math.round(p.timeSpent / 60)}m`
                                    : "—"}
                                {p.intent && (
                                    <span className="text-neutral-400 italic">
                                        • {p.intent}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                ))}
            </Sidebar>

            <Modal
                isOpen={!!selectedPage}
                onClose={() => setSelectedPage(null)}
                title={selectedPage?.title}
                widthClass="max-w-xl"
            >
                {selectedPage && (
                    <div className="space-y-3 text-sm text-neutral-300">
                        <p>
                            <strong>URL:</strong>{" "}
                            <a
                                href={selectedPage.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 hover:underline break-all"
                            >
                                Visit website <FontAwesomeIcon icon={faLink} />
                            </a>
                        </p>
                        <div className="flex justify-between items-center">
                            {selectedPage.intent && (
                                <p>
                                    <strong>Intent:</strong>{" "}
                                    <span className="text-brand-500">
                                        {selectedPage.intent}
                                    </span>
                                </p>
                            )}
                            {selectedPage.timeSpent && (
                                <p>
                                    <strong>Time Spent:</strong>{" "}
                                    {Math.round(selectedPage.timeSpent / 1000)}s
                                </p>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div>
                                <strong>AI Suggestions:</strong>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() =>
                                                window.open(
                                                    `https://www.google.com/search?q=${encodeURIComponent(
                                                        s.text,
                                                    )}`,
                                                    "_blank",
                                                )
                                            }
                                            className="px-3 py-1 bg-neutral-800 rounded-full text-xs hover:bg-brand-600 hover:text-white transition"
                                        >
                                            {s.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!selectedPage.isSummarizationComplete && (
                            <div className="text-center py-2 text-neutral-400">
                                Summarization in process...
                            </div>
                        )}

                        {selectedPage.isSummarizationComplete &&
                            selectedPage.summary && (
                                <div>
                                    <strong>Summary:</strong>
                                    <div className="mt-1">
                                        <Markdown
                                            content={selectedPage.summary}
                                        />
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export function QuestionItem({
    question,
    answer,
}: {
    question: string;
    answer: string;
}) {
    const [revealed, setRevealed] = useState(false);

    return (
        <div className=" rounded-lg p-4 hover:border-brand-600 transition group">
            <div className="flex items-start justify-between">
                <h3 className="text-base text-neutral-200 font-medium">
                    Q. {question}
                </h3>
                <button
                    onClick={() => setRevealed((r) => !r)}
                    className="text-neutral-500 hover:text-brand-400 transition ml-3"
                    title={revealed ? "Hide answer" : "Reveal answer"}
                >
                    <FontAwesomeIcon
                        icon={revealed ? faEyeSlash : faEye}
                        className="text-base"
                    />
                </button>
            </div>

            <div
                className={`mt-3 font-mono text-sm tracking-wide transition-all duration-300 ${
                    revealed
                        ? "text-neutral-300 blur-0 opacity-100"
                        : "text-neutral-600 blur-sm opacity-60 select-none"
                }`}
            >
                {revealed ? (
                    <span className="wrap-break-words">{answer}</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                        <span className="tracking-widest">
                            {"•".repeat(Math.min(answer.length, 30))}
                            {answer.length > 30 && "•••"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
