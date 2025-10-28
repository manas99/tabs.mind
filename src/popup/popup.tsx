import { useEffect, useState } from "react";
import { Logo } from "../components/logo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPause,
    faPlay,
    faSquareArrowUpRight,
    faStop,
} from "@fortawesome/free-solid-svg-icons";
import type { SessionState } from "../libs/constants";
import { SessionService } from "../libs/sessions";
import { AiService } from "../libs/ai";
import { getCurrentPageId } from "../libs/chrome";
import { db } from "../libs/db";
import { Button } from "../components/button";

export function Popup() {
    const [models, setModels] = useState<any[]>([]);
    const [state, setState] = useState<SessionState>("stopped");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const allReady = models.every((m) => m.availability === "available");

    const handleDownload = async () => {
        try {
            AiService.Instance.downloadModels();
        } catch (err) {
            console.error(err);
            alert("Failed to download model. Please try again.");
        }
    };

    const startSession = async () => {
        setState("running");
        await SessionService.start();
    };

    const pauseSession = async () => {
        setState("paused");
        await SessionService.pause();
    };

    const stopSession = async () => {
        setState("stopped");
        await SessionService.stop();
    };

    const openApp = () => {
        const url = chrome.runtime.getURL("src/app/index.html");
        chrome.tabs.create({ url });
    };

    const handleSuggestionClick = (text: string) => {
        chrome.tabs.create({
            url: `https://www.google.com/search?q=${encodeURIComponent(text)}`,
        });
    };

    const getAndSetPageData = async () => {
        const pageId = await getCurrentPageId();
        if (!pageId) {
            return false;
        }
        const page = await db.pages.where("id").equals(pageId).first();
        if (!page || !page.isSummarizationComplete) {
            return false;
        }
        const suggestions = await db.suggestions
            .where("pageId")
            .equals(pageId)
            .toArray();
        setSuggestions(suggestions.map((s) => s.text));
        return true;
    };

    useEffect(() => {
        if (state !== "running") return;
        let interval: any;

        (async () => {
            const res = await getAndSetPageData();
            if (res) return;
            interval = setInterval(async () => {
                const res = await getAndSetPageData();
                if (res) clearInterval(interval);
            }, 2000);
        })();
        return () => clearInterval(interval);
    }, [state]);

    useEffect(() => {
        AiService.Instance.checkModels().then(setModels);
    }, []);

    useEffect(() => {
        SessionService.current().then((current) => {
            if (current) setState(current.state);
        });
    }, []);

    return (
        <div className="space-y-5 w-80 p-4 text-center text-neutral-100">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Logo />
                {state === "running" && (
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                )}
            </div>

            {!allReady ? (
                <div className="p-4 text-xs text-neutral-400 ">
                    <p className="text-neutral-300 mb-2">
                        Chrome AI model required
                    </p>
                    <button
                        onClick={handleDownload}
                        className="w-full rounded-lg bg-brand-600 px-3 py-2 mt-1 text-white font-medium hover:bg-brand-500 transition"
                    >
                        Download AI Model
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between w-full px-4 py-8">
                        <div className="flex flex-col items-center w-16">
                            {state === "running" && (
                                <span className="text-xs text-green-400 font-medium">
                                    Recording
                                </span>
                            )}
                            {state === "paused" && (
                                <span className="text-xs text-yellow-400 font-medium">
                                    Paused
                                </span>
                            )}
                            {state === "stopped" && (
                                <span className="text-xs text-neutral-500">
                                    Idle
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-center">
                            {(state === "stopped" || state === "paused") && (
                                <button
                                    onClick={startSession}
                                    title="Start"
                                    className="h-14 w-14 flex items-center justify-center rounded-full bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition"
                                >
                                    <FontAwesomeIcon icon={faPlay} size="lg" />
                                </button>
                            )}

                            {state === "running" && (
                                <button
                                    onClick={pauseSession}
                                    title="Pause"
                                    className="h-14 w-14 flex items-center justify-center rounded-full bg-yellow-500/90 hover:bg-yellow-400 text-black font-medium shadow-md transition"
                                >
                                    <FontAwesomeIcon icon={faPause} size="lg" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-center w-16">
                            {state !== "stopped" && (
                                <button
                                    onClick={stopSession}
                                    title="Stop"
                                    className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-red-600/90 bg-red-600/80 transition shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faStop} />
                                </button>
                            )}
                        </div>
                    </div>

                    {suggestions.length > 0 && (
                        <div className="pt-3 border-t border-neutral-800">
                            <div className="text-xs mb-2 text-neutral-400">
                                Smart Suggestions
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(s)}
                                        className="px-3 py-1 text-xs rounded-full border border-neutral-700 bg-neutral-800 hover:bg-brand-600 hover:border-brand-600 hover:text-white transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        onClick={openApp}
                        className="w-full rounded-lg mt-4 px-3 py-2 font-medium text-sm bg-neutral-800 hover:bg-brand-600 hover:text-white transition flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faSquareArrowUpRight} />
                        Open App
                    </Button>
                </>
            )}
        </div>
    );
}
