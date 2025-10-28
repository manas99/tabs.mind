import { sendMessage } from "../libs/chrome";

function extractPage() {
    const title =
        document
            .querySelector("meta[property='og:title']")
            ?.getAttribute("content") ||
        document.title ||
        "";

    const url = location.href;
    const domain = location.hostname;

    const favicon =
        document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href ||
        `https://${domain}/favicon.ico`;

    let text = "";
    const main =
        document.querySelector("main") ||
        document.querySelector("article") ||
        document.querySelector('[role="main"]');

    if (main) {
        text = main.innerText;
    } else {
        const candidates = Array.from(
            document.querySelectorAll("h1, h2, h3, p, li, blockquote"),
        );
        const visible = candidates.filter((n) => {
            const style = window.getComputedStyle(n);
            return style.display !== "none" && style.visibility !== "hidden";
        });
        text = visible.map((n) => n.textContent?.trim() || "").join("\n\n");
    }

    text = text
        .replace(/\s{3,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const description =
        document
            .querySelector("meta[name='description']")
            ?.getAttribute("content") ||
        document
            .querySelector("meta[property='og:description']")
            ?.getAttribute("content") ||
        "";

    const keywords =
        document
            .querySelector("meta[name='keywords']")
            ?.getAttribute("content") || "";

    return {
        title,
        url,
        domain,
        favicon,
        description,
        keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        text,
        length: text.length,
    };
}

(async () => {
    const { title, url, domain, favicon, text } = extractPage();
    await sendMessage("PAGE_CAPTURE", {
        title,
        url,
        domain,
        favicon,
        text,
    });
})();
