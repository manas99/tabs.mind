import { SessionService } from "../libs/sessions";
import { Jobs } from "./jobs";

let currentTab: number | null = null;
let currentPageId: number | null = null;
let currentStart: number | null = null;
let lastUrl: string | null = null;

async function recordElapsed() {
    if (!currentPageId || !currentStart) return;
    const elapsed = Math.floor((Date.now() - currentStart) / 1000);
    if (elapsed < 2) return;
    await new Jobs().captureElapsedTime(currentPageId, elapsed);
    currentStart = Date.now();
}

async function setCurrent(tabId: number, pageId: number) {
    currentTab = tabId;
    currentPageId = pageId;
    currentStart = Date.now();
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    await recordElapsed();

    const stored = await chrome.storage.local.get(`page_${tabId}`);
    const pageId = parseInt(stored[`page_${tabId}`]);
    if (pageId) await setCurrent(tabId, pageId);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await recordElapsed();
        currentTab = null;
        currentPageId = null;
        return;
    }

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    if (tab?.id) {
        const stored = await chrome.storage.local.get(`page_${tab.id}`);
        const pageId = parseInt(stored[`page_${tab.id}`]);
        if (pageId) await setCurrent(tab.id, pageId);
    }
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return; // only top-level
    if (details.url === lastUrl) return;
    if (
        details.url.startsWith("chrome://") ||
        details.url.startsWith("edge://") ||
        details.url.startsWith("about:") ||
        details.url.startsWith("devtools://") ||
        details.url.startsWith("chrome-extension://")
    ) {
        return;
    }
    lastUrl = details.url;

    await recordElapsed();

    const active = await SessionService.active();
    if (!active?.id) return;

    const domain = new URL(details.url).hostname;
    const tab = await chrome.tabs.get(details.tabId);
    const title = tab?.title || "";

    const pageId = await SessionService.addPage({
        title: title,
        url: details.url,
        domain,
        favicon: `https://${domain}/favicon.ico`,
        createdAt: new Date(),
        sessionId: active.id,
    });
    if (!pageId) {
        return;
    }

    await chrome.storage.local.set({ [`page_${details.tabId}`]: pageId });
    await setCurrent(details.tabId, pageId);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    if (tabId === currentTab) {
        await recordElapsed();
        currentTab = null;
        currentPageId = null;
    }
    await chrome.storage.local.remove(`page_${tabId}`);
});

chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener(async (state) => {
    if (state !== "active") {
        await recordElapsed();
    } else if (currentTab && currentPageId) {
        currentStart = Date.now();
    }
});

setInterval(async () => {
    await recordElapsed();
}, 30000);
