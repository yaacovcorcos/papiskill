export type RegistryNamespace = "community" | "global" | "official";
export type CanonicalRegistryNamespace = "community" | "official";
export type RegistryKind = "community" | "global" | "profile";

export interface RegistrySkillReference {
  kind: "registry";
  namespace: RegistryNamespace;
  canonicalNamespace: CanonicalRegistryNamespace;
  registryKind: Exclude<RegistryKind, "profile">;
  slug: string;
  reference: string;
  path: string;
}

export interface ProfileSkillReference {
  kind: "profile";
  handle: string;
  registryKind: "profile";
  slug: string;
  reference: string;
  path: string;
}

export type SkillReference = ProfileSkillReference | RegistrySkillReference;

const publicRegistryNamespaces = new Set<string>([
  "official",
  "global",
  "community",
]);

export function referenceParts(reference: string): string[] {
  return reference
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function referenceSlug(reference: string): string | null {
  return referenceParts(reference).at(-1) ?? null;
}

export function parseSkillReference(reference: string): SkillReference | null {
  const parts = referenceParts(reference);
  if (parts.length > 2) return null;

  const slug = parts.at(-1);
  if (!slug) return null;

  const namespace = parts.length > 1 ? parts[0] : "official";
  if (!namespace) return null;

  if (isRegistryNamespace(namespace)) {
    const canonicalNamespace = canonicalRegistryNamespace(namespace);
    const registryKind = canonicalNamespace === "community" ? "community" : "global";
    return {
      kind: "registry",
      namespace,
      canonicalNamespace,
      registryKind,
      slug,
      reference: `${canonicalNamespace}/${slug}`,
      path: `/skills/${canonicalNamespace}/${slug}`,
    };
  }

  return {
    kind: "profile",
    handle: namespace,
    registryKind: "profile",
    slug,
    reference: `${namespace}/${slug}`,
    path: `/u/${namespace}/skills/${slug}`,
  };
}

export function isPublicRegistryReference(reference: string): boolean {
  return parseSkillReference(reference)?.kind === "registry";
}

export function skillReference(skill: {
  registryKind: string;
  slug: string;
  author: string | null;
}): string {
  return skillReferenceParts(skill).reference;
}

export function skillHref(skill: {
  registryKind: string;
  slug: string;
  author: string | null;
}): string {
  return skillReferenceParts(skill).path;
}

export function statusBadgeLabel(registryKind: string): string {
  if (registryKind === "global") return "Global";
  if (registryKind === "community") return "Community";
  return "Profile";
}

export function canonicalRegistryReference(
  registryKind: string,
  slug: string,
): string {
  return `${canonicalRegistryNamespaceForKind(registryKind)}/${slug}`;
}

export function canonicalRegistryPath(registryKind: string, slug: string): string {
  return `/skills/${canonicalRegistryNamespaceForKind(registryKind)}/${slug}`;
}

function skillReferenceParts(skill: {
  registryKind: string;
  slug: string;
  author: string | null;
}): Pick<SkillReference, "path" | "reference"> {
  if (skill.registryKind === "profile" && skill.author) {
    return {
      reference: `${skill.author}/${skill.slug}`,
      path: `/u/${skill.author}/skills/${skill.slug}`,
    };
  }

  return {
    reference: canonicalRegistryReference(skill.registryKind, skill.slug),
    path: canonicalRegistryPath(skill.registryKind, skill.slug),
  };
}

function canonicalRegistryNamespace(
  namespace: RegistryNamespace,
): CanonicalRegistryNamespace {
  return namespace === "community" ? "community" : "official";
}

function canonicalRegistryNamespaceForKind(
  registryKind: string,
): CanonicalRegistryNamespace {
  return registryKind === "community" ? "community" : "official";
}

function isRegistryNamespace(value: string): value is RegistryNamespace {
  return publicRegistryNamespaces.has(value);
}
