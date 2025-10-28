import { INTENTS } from "./constants";
import type { Page, Session } from "./db";

export class Prompts {
    static intent(
        title: string,
        url: string,
        domain: string,
        path: string,
        text: string,
    ): { system: string; user: string } {
        const systemPrompt = `You are a web intent classifier.
            Given a web page's metadata, HTML structure, and text, return ONE of:
            ${INTENTS.join(", ")}.

            Definitions:
            - "search": page shows search results or query listings.
            - "reading": article, blog, wiki, or educational content.
            - "shopping": product, marketplace, or e-commerce.
            - "media": video or music playback.
            - "social": post feed, profile, or discussion.
            - "technical": programming, API docs, StackOverflow.
            - "work": productivity tools (Notion, Docs, dashboards).
            - "entertainment": memes, games, fun content.
            - "news": current events or updates.
            - "generic": other or unclear.

            Return only one intent name.`;

        const userPrompt = `Title: ${title}
            URL: ${url}
            Domain: ${domain}
            Path: ${path}

            Extracted text (first 3000 chars):
            ${text.slice(0, 3000)}`;

        return { system: systemPrompt, user: userPrompt };
    }

    static searchSuggestions(
        title: string,
        summary: string,
    ): { system: string; user: string } {
        return {
            system: `You are a research assistant.
                Based on the following web page summary, suggest 3 next search ideas that would help the user continue their research.`,
            user: `
                Title: ${title}
                Summary: ${summary}

                Return only 3 short, clear search queries or topics in an array.`,
        };
    }

    static sessionReport(
        session: Session,
        chunkSummaries: string[],
    ): { system: string; user: string; schema: any } {
        const systemPrompt = `
            You are a research assistant. Given a set of summarized web pages from a user's browsing session,
            generate a comprehensive research report, 5 to 10 next steps or suggestions and approximately 10 one-line or one-word question answers related to the report or the pages summary.

            The report should be structured in markdown with these sections:
            1. **Session Overview** — summarize the user's intent and general topics in not more than 3 to 4 lines
            2. **Key Findings** — extract important insights and themes in points.

            Output only in JSON format, such that there are three keys -
            - "report": should be string in markdown format containing details as described above.
            - "suggestions": should be in bullets format in a single markdown string and these points should recommend what to explore next and if possible add links to search or available links.
            - "questions": contains an array of objects containing keys "question" and "answer". This array has 1 liner or 1 word question and answers.

            Example output - {"report": "Report ... end", "suggestions": "* suggestion 1 ...","questions": [{"question": "What is ... ", "answer": "XYZ"}]}
            Only conform to this format in JSON else throw error
        `;

        const allChunks = chunkSummaries
            .map((c, i) => `Chunk ${i + 1} - ${c}`)
            .join("\n\n");

        const userPrompt = `
        Session Title: ${session.title || "Untitled"}
        Started At: ${new Date(session.createdAt).toLocaleString()}
        Total Time: ${(session.timeSpent || 0) / 60} mins

        Here are the summaries of the pages visited in chunks:

        ${allChunks}
        `;
        return {
            system: systemPrompt,
            user: userPrompt,
            schema: {
                type: "object",
                properties: {
                    report: { type: "string" },
                    suggestions: { type: "string" },
                    questions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question: { type: "string" },
                                answer: { type: "string" },
                            },
                        },
                    },
                },
            },
        };
    }

    static pageChunkSummaries(batch: Page[]): { system: string; user: string } {
        const batchText = batch
            .map(
                (p, i) => `
                    ### Page ${i + 1}: ${p.title}
                    - URL: ${p.url}
                    - Intent: ${p.intent || "unknown"}
                    - Domain: ${p.domain}
                    - Time Spent: ${(p.timeSpent || 0) / 1000}s
                    - Summary:
                    ${p.summary || "No summary available."}
                `,
            )
            .join("\n\n");
        return {
            system: "Create a brief analytical summary of the following web pages:",
            user: batchText,
        };
    }
}
