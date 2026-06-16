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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayMarkdown}</ReactMarkdown>
    </article>
  );
}
