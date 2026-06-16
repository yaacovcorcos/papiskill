const publicRegistryNamespaces = new Set(["official", "global", "community"]);

export function referenceParts(reference: string): string[] {
  return reference.split("/").filter(Boolean);
}

export function referenceSlug(reference: string): string | null {
  return referenceParts(reference).at(-1) ?? null;
}

export function isPublicRegistryReference(reference: string): boolean {
  const parts = referenceParts(reference);
  if (parts.length <= 1) return true;
  return publicRegistryNamespaces.has(parts[0] ?? "");
}
