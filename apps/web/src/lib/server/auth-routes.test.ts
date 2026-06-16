import { describe, expect, it } from "vitest";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

describe("auth route wiring", () => {
  it("does not link to the legacy Better Auth GitHub endpoint directly", async () => {
    const sourceFiles = await listSourceFiles(path.resolve(process.cwd(), "src"));
    const legacyPath = ["/api/auth", "sign-in", "github"].join("/");
    const matches: string[] = [];

    for (const file of sourceFiles) {
      const content = await readFile(file, "utf8");
      if (content.includes(legacyPath)) {
        matches.push(path.relative(process.cwd(), file));
      }
    }

    expect(matches).toEqual([]);
  });
});

async function listSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listSourceFiles(fullPath);
      }
      if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        return [fullPath];
      }
      return [];
    }),
  );

  return files.flat();
}
