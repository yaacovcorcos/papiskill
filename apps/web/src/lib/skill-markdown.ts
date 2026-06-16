const frontmatterPattern = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export function stripSkillFrontmatter(markdown: string): string {
  return markdown.replace(frontmatterPattern, "").trimStart();
}
