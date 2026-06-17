export function starCountLabel(count: number) {
  return `${count} ${count === 1 ? "star" : "stars"}`;
}

export function signInToStarLabel(count: number) {
  return `Sign in to star skill. ${starCountLabel(count)}.`;
}

export function copyInstallCommandLabel(name: string) {
  return `Copy install command for ${name}`;
}

export function downloadSkillLabel(name: string) {
  return `Download ${name}`;
}

export function openProfileSkillLabel(name: string) {
  return `Open ${name} profile page`;
}

export function commentAuthorLabel(authorHandle?: string | null, authorName?: string | null) {
  return authorHandle ? `@${authorHandle}` : (authorName ?? "PapiSkill user");
}

export function hideCommentLabel(authorHandle?: string | null, authorName?: string | null) {
  return `Hide comment by ${commentAuthorLabel(authorHandle, authorName)}`;
}

export function deleteCommentLabel(authorHandle?: string | null, authorName?: string | null) {
  return `Delete comment by ${commentAuthorLabel(authorHandle, authorName)}`;
}
