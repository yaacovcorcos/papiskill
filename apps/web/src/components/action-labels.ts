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
