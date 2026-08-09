import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, href, node, ...props }) => {
          void node;

          if (!href) {
            return <span>{children}</span>;
          }

          return (
            <a
              {...props}
              href={href}
              rel="noreferrer noopener"
              target="_blank"
            >
              {children}
            </a>
          );
        },
      }}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      skipHtml
    >
      {content}
    </ReactMarkdown>
  );
}
