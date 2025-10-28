import type { EventMsgType } from "./constants";

export function sendMessage<T = any>(
    type: EventMsgType,
    payload?: any,
): Promise<T> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, payload }, (response) => {
            const err = chrome.runtime.lastError;
            if (err) return reject(new Error(err.message));
            if (!response) return reject(new Error("No response received"));
            resolve(response);
        });
    });
}

export async function getCurrentPageId(): Promise<number | undefined> {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    if (!tab?.id) return;
    const res = await chrome.storage.local.get(`page_${tab.id}`);
    return res[`page_${tab.id}`] ? Number(res[`page_${tab.id}`]) : undefined;
}
