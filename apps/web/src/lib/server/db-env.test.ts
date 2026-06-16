import { afterEach, describe, expect, it } from "vitest";
import { getDatabaseUrl, hasDatabaseUrl } from "./db-env";

const originalDatabaseUrl = process.env.DATABASE_URL;
const originalDirectUrl = process.env.DIRECT_URL;

afterEach(() => {
  process.env.DATABASE_URL = originalDatabaseUrl;
  process.env.DIRECT_URL = originalDirectUrl;
});

describe("database env helpers", () => {
  it("treats empty and quoted-empty values as unconfigured", () => {
    process.env.DATABASE_URL = "\"\"";
    process.env.DIRECT_URL = "''";

    expect(getDatabaseUrl()).toBeNull();
    expect(hasDatabaseUrl()).toBe(false);
  });

  it("uses a real database URL", () => {
    process.env.DATABASE_URL = "postgresql://example";
    process.env.DIRECT_URL = undefined;

    expect(getDatabaseUrl()).toBe("postgresql://example");
    expect(hasDatabaseUrl()).toBe(true);
  });
});
