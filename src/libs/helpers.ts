export function cleanMarkdown(raw: string): string {
    if (!raw) return "";
    return raw
        .replace(/^```(?:markdown)?/i, "")
        .replace(/```$/, "")
        .trim();
}
