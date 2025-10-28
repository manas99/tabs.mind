import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

export function Markdown({ content }: { content: string }) {
    return (
        <div
            className="
                prose prose-invert max-w-none w-full
                text-[0.9rem] leading-relaxed
                prose-p:my-1 prose-p:text-[0.9rem]
                prose-li:my-0.5 prose-li:text-[0.9rem]
                prose-headings:mt-3 prose-headings:mb-2
                prose-headings:text-[1rem] prose-headings:font-semibold
                prose-code:text-amber-300 prose-code:text-[0.85rem]
                prose-pre:bg-neutral-900 prose-pre:text-[0.85rem]
                prose-a:text-brand-400 hover:prose-a:text-brand-300
            "
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    [
                        rehypeExternalLinks,
                        { target: "_blank", rel: ["noopener", "noreferrer"] },
                    ],
                ]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
