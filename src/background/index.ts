import "./timetracker";
import type { EventMsgType } from "../libs/constants";
import { SessionService } from "../libs/sessions";
import { Jobs } from "./jobs";
import { BackgroundQueue } from "./queue";

chrome.runtime.onInstalled.addListener(() => {
    const url = chrome.runtime.getURL("src/app/index.html");
    chrome.tabs.create({ url });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const q = BackgroundQueue.Instance;
    const tabId = sender.tab?.id;
    const { type, payload } = msg as { type: EventMsgType; payload: any };
    (async () => {
        if (type === "PAGE_CAPTURE") {
            const active = await SessionService.active();
            if (!active?.id) return;

            let pageId: number | undefined;
            const stored = await chrome.storage.local.get(`page_${tabId}`);
            if (stored[`page_${tabId}`]) {
                pageId = parseInt(stored[`page_${tabId}`]);
            }

            if (!pageId) {
                return;
            }

            sendResponse({ ok: true, pageId });

            q.enqueue(async () => {
                await new Jobs().capturePage(
                    tabId,
                    pageId,
                    payload.title,
                    payload.url,
                    payload.text,
                );
            });
        }

        if (type === "PAGE_TIME_UPDATE") {
            q.enqueue(async () => {
                await new Jobs().captureElapsedTime(
                    payload.pageId,
                    payload.elapsed,
                );
            });
            sendResponse({ ok: true });
        }

        if (type === "SESSION_GENERATE_REPORT") {
            const sessionId = payload.sessionId;
            if (!sessionId) return;

            const session = await SessionService.get(sessionId);
            if (!session) return;

            await SessionService.startReport(sessionId);

            sendResponse({ ok: true });
            q.enqueue(async () => {
                await new Jobs().captureSessionReport(sessionId);
            });
        }
    })();
    return true;
});
