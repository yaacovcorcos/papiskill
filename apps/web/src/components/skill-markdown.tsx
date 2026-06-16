import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { stripSkillFrontmatter } from "../lib/skill-markdown";

interface SkillMarkdownProps {
  markdown: string;
  className?: string;
}

export function SkillMarkdown({ markdown, className = "" }: SkillMarkdownProps) {
  const displayMarkdown = stripSkillFrontmatter(markdown);

  return (
    <article className={`skill-markdown ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => {
            void node;
            return <h2 {...props} />;
          },
          h2: ({ node, ...props }) => {
            void node;
            return <h3 {...props} />;
          },
          h3: ({ node, ...props }) => {
            void node;
            return <h4 {...props} />;
          },
          h4: ({ node, ...props }) => {
            void node;
            return <h5 {...props} />;
          },
          h5: ({ node, ...props }) => {
            void node;
            return <h6 {...props} />;
          },
        }}
      >
        {displayMarkdown}
      </ReactMarkdown>
    </article>
  );
}
