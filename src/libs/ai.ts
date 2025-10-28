import { INTENTS, SUMMARIZATION_PROMPTS, type PageIntent } from "./constants";
import type { Page, Session } from "./db";
import { Prompts } from "./prompts";

export type ModelType = "language" | "summarizer";

interface ModelInfo {
    type: ModelType;
    name: string;
    availability: string;
    progress: number;
}

export class AiService {
    private static _instance: AiService;
    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private _modelAvailability: boolean = false;
    private _models: Record<ModelType, ModelInfo> = {
        language: {
            type: "language",
            name: "Language",
            availability: "unavailable",
            progress: 0,
        },
        summarizer: {
            type: "summarizer",
            name: "Summarizer",
            availability: "unavailable",
            progress: 0,
        },
    };
    private _modelClassMap: Record<ModelType, () => any> = {
        language: () => (self as any).LanguageModel,
        summarizer: () => (self as any).Summarizer,
    };

    private languageModel: any;
    private summarizerModel: any;
    private teaserModel: any;
    private headerModel: any;

    private constructor() {}

    async checkModels(): Promise<ModelInfo[]> {
        for (const type of Object.keys(this._modelClassMap) as ModelType[]) {
            const Klass = this._modelClassMap[type]();
            if (!Klass) {
                this._models[type].availability = "unavailable";
                this._models[type].progress = 0;
                continue;
            }
            const availability = await Klass.availability();
            this._models[type].availability = availability;
            this._models[type].progress =
                availability === "available" ? 100 : 0;
        }
        await chrome.storage.local.set({ models: this._models });
        const results = Object.values(this._models);

        this._modelAvailability = results.reduce(
            (acc, row) => acc && row.availability === "available",
            true,
        );
        return results;
    }

    async downloadModel(
        type: ModelType,
        onProgress?: (p: number) => void,
    ): Promise<boolean> {
        const Klass = this._modelClassMap[type]();
        if (!Klass)
            throw new Error(`Model ${type} not supported in this browser`);

        const availability = await Klass.availability();
        if (availability === "available") {
            this._models[type].availability = "available";
            this._models[type].progress = 100;
            await chrome.storage.local.set({ models: this._models });
            return true;
        }

        this._models[type].availability = "downloading";
        this._models[type].progress = 0;
        await chrome.storage.local.set({ models: this._models });
        onProgress?.(0);

        const model = await Klass.create({
            monitor: (progress: number) => {
                const pct = Math.max(
                    0,
                    Math.min(100, Math.round(progress * 100)),
                );
                this._models[type].progress = pct;
                onProgress?.(pct);
            },
            outputLanguage: "en",
        });

        await model.ready;

        this._models[type].availability = "available";
        this._models[type].progress = 100;
        await chrome.storage.local.set({ models: this._models });

        return true;
    }

    async loadLanguageModel() {
        if (!this._modelAvailability) {
            await this.checkModels();
        }
        this.languageModel = await this._modelClassMap
            .language()
            .create({ outputLanguage: "en" });
    }

    async loadSummarizerModel() {
        if (!this._modelAvailability) {
            await this.checkModels();
        }
        this.summarizerModel = await this._modelClassMap.summarizer().create({
            outputLanguage: "en",
            length: "medium",
        });
    }

    async loadTeaserModel() {
        if (!this._modelAvailability) {
            await this.checkModels();
        }
        this.teaserModel = await this._modelClassMap.summarizer().create({
            format: "plain-text",
            type: "teaser",
            outputLanguage: "en",
            length: "short",
        });
    }

    async loadHeaderModel() {
        if (!this._modelAvailability) {
            await this.checkModels();
        }
        this.headerModel = await this._modelClassMap.summarizer().create({
            format: "plain-text",
            type: "headline",
            outputLanguage: "en",
            length: "short",
        });
    }

    private detectIntentFromUrl(url: string): PageIntent | null {
        const domain = new URL(url).hostname;

        if (/google\..*\/search/.test(url)) return "search";
        if (/youtube\.com\/watch/.test(url)) return "media";
        if (/amazon\.|flipkart\.|ebay\./.test(domain)) return "shopping";
        if (/medium\.com|substack\.com|wikipedia\.org/.test(domain))
            return "reading";
        if (/bbc\.|nytimes\.|indiatimes\.|reuters\./.test(domain))
            return "news";
        if (/x\.com|twitter\.com|reddit\.com|linkedin\.com/.test(domain))
            return "social";
        if (/github\.com|stackoverflow\.com|developer\.|docs\./.test(domain))
            return "technical";
        if (/notion\.so|docs\.google\.com|trello\.com/.test(domain))
            return "work";
        if (/netflix\.com|twitch\.tv|pinterest\.com/.test(domain))
            return "entertainment";

        return null;
    }

    async detectIntent(
        title: string,
        url: string,
        text: string,
    ): Promise<PageIntent> {
        const staticIntent = this.detectIntentFromUrl(url);
        if (staticIntent) {
            return staticIntent;
        }

        if (!this.languageModel) await this.loadLanguageModel();
        const domain = new URL(url).hostname;
        const path = new URL(url).pathname;
        const prompt = Prompts.intent(title, url, domain, path, text);

        const result = await this.languageModel.prompt(
            prompt.system + "\n" + prompt.user,
            {
                temperature: 0,
            },
        );
        const cleaned = result.trim().toLowerCase();
        const valid = INTENTS.includes(cleaned as PageIntent);
        return valid ? (cleaned as PageIntent) : "generic";
    }

    async summarize(
        intent: PageIntent,
        text: string,
    ): Promise<{ summary: string; teaser: string }> {
        if (!this.summarizerModel) await this.loadSummarizerModel();
        if (!this.teaserModel) await this.loadTeaserModel();

        const basePrompt: any = SUMMARIZATION_PROMPTS[intent];
        const slicedText = text.slice(0, 80000);
        const [summary, teaser] = await Promise.all([
            this.summarizerModel.summarize(slicedText, {
                context: basePrompt,
            }),
            this.teaserModel.summarize(slicedText, {
                context: basePrompt,
            }),
        ]);

        return { summary: summary.trim(), teaser: teaser.trim() };
    }

    async getHeaderForSession(teasers: string[]): Promise<string> {
        if (!this.headerModel) await this.loadHeaderModel();
        const headline = this.headerModel.summarize(teasers.join("\n"), {});
        return headline;
    }

    async searchSuggestions(title: string, summary: string): Promise<string[]> {
        if (!this.languageModel) await this.loadLanguageModel();
        const prompt = Prompts.searchSuggestions(title, summary);
        const schema = {
            type: "array",
            items: {
                type: "string",
            },
        };

        const response = await this.languageModel.prompt(
            prompt.system + "\n" + prompt.user,
            {
                temperature: 0.8,
                responseConstraint: schema,
            },
        );
        try {
            const res = JSON.parse(response);
            if (Array.isArray(res)) {
                return res;
            }
        } catch (err: any) {
            console.log(err);
        }

        const suggestions = response
            .split("\n")
            .map((l: any) => (l as string).replace(/^\d+\.\s*/, "").trim())
            .filter(Boolean)
            .slice(0, 3);
        return suggestions;
    }

    async sessionReport(
        session: Session,
        chunkSummaries: string[],
    ): Promise<string> {
        if (!this.languageModel) await this.loadLanguageModel();
        const prompt = Prompts.sessionReport(session, chunkSummaries);
        const response = await this.languageModel.prompt(
            prompt.system + "\n" + prompt.user,
            {
                temperature: 0.8,
                responseConstraint: prompt.schema,
            },
        );
        return response;
    }

    async pageChunkSummaries(pages: Page[]): Promise<string> {
        if (!this.languageModel) await this.loadLanguageModel();
        const prompt = Prompts.pageChunkSummaries(pages);
        const response = await this.languageModel.prompt(
            prompt.system + "\n" + prompt.user,
            {
                temperature: 0.8,
            },
        );
        return response;
    }
}
