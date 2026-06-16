function cleanDatabaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "\"\"" || trimmed === "''") return null;

  const unquoted = trimmed.replace(/^(['"])(.*)\1$/, "$2").trim();
  return unquoted.length > 0 ? unquoted : null;
}

export function getDatabaseUrl(): string | null {
  return cleanDatabaseUrl(process.env.DATABASE_URL) ?? cleanDatabaseUrl(process.env.DIRECT_URL);
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getDatabaseUrl());
}
