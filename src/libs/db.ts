import Dexie, { type Table } from "dexie";
import type { PageIntent, SessionState } from "./constants";

export interface Suggestion {
    id?: number;
    pageId: number;
    text: string;
    createdAt: Date;
}

export interface Page {
    id?: number;
    sessionId: number;
    url: string;
    title: string;
    domain: string;
    favicon?: string;
    createdAt: Date;
    intent?: PageIntent;
    summary?: string;
    teaser?: string;
    timeSpent?: number;
    isSummarizationComplete?: boolean;
}

export interface Session {
    id?: number;
    title?: string;
    createdAt: Date;
    updatedAt: Date;
    state: SessionState;
    timeSpent?: number;
    isReportGenerating?: boolean;
}

export interface SessionReport {
    id?: number;
    sessionId: number;
    report: string;
    createdAt: Date;
    isOutdated?: boolean;
}

export interface ReportQuestions {
    id?: number;
    reportId: number;
    question: string;
    answer: string;
}

class AppDatabase extends Dexie {
    sessions!: Table<Session, number>;
    pages!: Table<Page, number>;
    suggestions!: Table<Suggestion, number>;
    reports!: Table<SessionReport, number>;

    constructor() {
        super("tabsmind.db");
        this.version(1).stores({
            sessions: "++id, createdAt, updatedAt, state, intent",
            pages: "++id, sessionId, url, createdAt, [sessionId+timeSpent]",
            suggestions: "++id, pageId, createdAt",
            reports: "++id, sessionId",
        });
    }
}

export const db = new AppDatabase();
