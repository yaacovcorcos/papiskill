import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTokenUser: vi.fn(),
  getSessionUser: vi.fn(),
  getSkillByReference: vi.fn(),
  getFileRegistrySkill: vi.fn(),
  logServerWarning: vi.fn(),
  hasDatabaseUrl: vi.fn(),
}));

vi.mock("@/lib/server/request-auth", () => ({
  getTokenUser: mocks.getTokenUser,
  getSessionUser: mocks.getSessionUser,
}));

vi.mock("@/lib/server/skills", () => ({
  getSkillByReference: mocks.getSkillByReference,
}));

vi.mock("@/lib/server/catalog", () => ({
  getFileRegistrySkill: mocks.getFileRegistrySkill,
}));

vi.mock("@/lib/server/db-env", () => ({
  hasDatabaseUrl: mocks.hasDatabaseUrl,
}));

vi.mock("@/lib/server/observability", () => ({
  logServerWarning: mocks.logServerWarning,
}));

const catalogSkill = {
  id: "code-review",
  slug: "code-review",
  name: "Code Review",
  summary: "Review code changes for bugs, risks, and missing tests.",
  description: "Portable code review skill.",
  registryKind: "global",
  visibility: "public",
  author: "papiskill",
  compatibleWith: ["codex", "claude-code", "cursor", "generic-agent"],
  tags: ["review"],
  categories: ["coding"],
  installCommand: "papiskill install official/code-review",
  markdown: "# Code Review\n\nReview carefully.",
  files: [{ path: "SKILL.md", content: "# Code Review\n\nReview carefully." }],
  installTargets: {},
  starCount: 0,
  commentCount: 0,
  validationIssues: [],
};

describe("GET /api/v1/skills/[...reference]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getTokenUser.mockResolvedValue(null);
    mocks.getSessionUser.mockResolvedValue(null);
    mocks.getSkillByReference.mockResolvedValue(null);
    mocks.getFileRegistrySkill.mockResolvedValue(catalogSkill);
    mocks.hasDatabaseUrl.mockReturnValue(true);
  });

  it("allows catalog fallback for official-style references", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request("https://papiskill.test/api/v1/skills/official/code-review"),
      { params: Promise.resolve({ reference: ["official", "code-review"] }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      slug: "code-review",
      registryKind: "global",
      files: [{ path: "SKILL.md", content: catalogSkill.markdown }],
    });
  });

  it("does not fall back from profile references to public skills with the same slug", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request("https://papiskill.test/api/v1/skills/alice/code-review"),
      { params: Promise.resolve({ reference: ["alice", "code-review"] }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.getFileRegistrySkill).not.toHaveBeenCalled();
  });

  it("logs database lookup failures while preserving the not-found response", async () => {
    const error = new Error("database unavailable");
    mocks.getSkillByReference.mockRejectedValue(error);
    const { GET } = await import("./route");

    const response = await GET(
      new Request("https://papiskill.test/api/v1/skills/alice/code-review"),
      { params: Promise.resolve({ reference: ["alice", "code-review"] }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.logServerWarning).toHaveBeenCalledWith(
      "api.skills.database_lookup_failed",
      error,
      {
        reference: "alice/code-review",
        actorSignedIn: false,
      },
    );
  });
});
