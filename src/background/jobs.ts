import { AiService } from "../libs/ai";
import { sendMessage } from "../libs/chrome";
import { db } from "../libs/db";
import { SessionService } from "../libs/sessions";

export class Jobs {
    async capturePage(
        tabId: number | undefined,
        pageId: number,
        title: string,
        url: string,
        text: string,
    ) {
        const intent = await AiService.Instance.detectIntent(title, url, text);
        const summary = await AiService.Instance.summarize(intent, text);
        const suggestions = await AiService.Instance.searchSuggestions(
            title,
            summary.summary,
        );
        await db.pages.update(pageId, {
            intent,
            summary: summary.summary,
            teaser: summary.teaser,
            isSummarizationComplete: true,
        });
        const suggestionsToAdd = suggestions.map((text: string) => ({
            pageId: pageId,
            text,
            createdAt: new Date(),
        }));
        await db.suggestions.bulkAdd(suggestionsToAdd);
        await sendMessage("PAGE_SUMMARIZATION_COMPLETE", {
            tabId: tabId,
            pageId: pageId,
            suggestions: suggestions,
        });
    }

    async captureSessionReport(sessionId: number) {
        await SessionService.generateReport(sessionId);
    }

    async captureElapsedTime(pageId: number, timeSpent: number) {
        await db.pages.update(pageId, { timeSpent: timeSpent });
    }
}
