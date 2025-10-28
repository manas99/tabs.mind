export const INTENTS = [
    "search", // looking something up
    "reading", // consuming knowledge
    "shopping", // viewing or comparing products
    "media", // watching or listening
    "social", // browsing or interacting on social platforms
    "technical", // reading dev/code content
    "work", // productivity, docs, dashboards
    "entertainment", // games, memes, etc.
    "news", // reading current events
    "generic", // unknown or mixed
] as const;

export type PageIntent = (typeof INTENTS)[number];

export type SessionState = "running" | "paused" | "stopped";

export const SUMMARIZATION_PROMPTS: Record<PageIntent, string> = {
    search: `The user performed a search. Summarize what they were likely trying to find and what themes appeared in the top results.`,
    reading: `Summarize this article concisely, focusing on key insights, facts, or takeaways.`,
    shopping: `Summarize this product page by listing the product name, main features, specs, and purpose.`,
    media: `Summarize what the video or media content is about.`,
    social: `Summarize the main topic or sentiment of this post or thread.`,
    technical: `Summarize this technical document, focusing on what technology or API it discusses.`,
    work: `Summarize what this document or workspace page is about.`,
    news: `Summarize the event or news story covered.`,
    entertainment: `Summarize what kind of entertainment content this is.`,
    generic: `Summarize the page briefly.`,
};

export type EventMsgType =
    | "PAGE_SUMMARIZATION_COMPLETE"
    | "PAGE_CAPTURE"
    | "SESSION_GENERATE_REPORT"
    | "PAGE_TIME_UPDATE"
    | "TEST";
