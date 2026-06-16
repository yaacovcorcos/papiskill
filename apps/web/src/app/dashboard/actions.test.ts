import { SkillVisibility } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw Object.assign(new Error(`redirect:${path}`), { path });
  }),
  getSessionUser: vi.fn(),
  ensureProfile: vi.fn(),
  createApiToken: vi.fn(),
  createLibraryCopy: vi.fn(),
  createBlankLibrarySkill: vi.fn(),
  persistForkValidation: vi.fn(),
  uniqueLibrarySlug: vi.fn(),
  validateForkDraftPackage: vi.fn(),
  prisma: {
    apiToken: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    profile: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    skillFork: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    skillForkFile: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/server/request-auth", () => ({
  getSessionUser: mocks.getSessionUser,
}));

vi.mock("@/lib/server/profiles", () => ({
  ensureProfile: mocks.ensureProfile,
  normalizeHandle: (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32),
  validateHandle: (value: string) => (value.length >= 3 ? null : "Use 3-32 lowercase letters, numbers, or hyphens."),
}));

vi.mock("@/lib/server/prisma", () => ({
  getPrisma: () => mocks.prisma,
}));

vi.mock("@/lib/server/tokens", () => ({
  createApiToken: mocks.createApiToken,
}));

vi.mock("@/lib/server/library", async () => {
  const actual = await vi.importActual<typeof import("../../lib/server/library")>("../../lib/server/library");
  return {
    ...actual,
    createLibraryCopy: mocks.createLibraryCopy,
    createBlankLibrarySkill: mocks.createBlankLibrarySkill,
    persistForkValidation: mocks.persistForkValidation,
    uniqueLibrarySlug: mocks.uniqueLibrarySlug,
    validateForkDraftPackage: mocks.validateForkDraftPackage,
  };
});

const user = {
  id: "user_123",
  email: "yaacov@example.com",
  name: "Yaacov",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSessionUser.mockResolvedValue(user);
  mocks.ensureProfile.mockResolvedValue({ id: "profile_123", userId: user.id, handle: "yaacov" });
  mocks.createApiToken.mockReturnValue({
    rawToken: "psk_test_raw",
    prefix: "psk_test_raw".slice(0, 12),
    tokenHash: "hashed-token",
  });
  mocks.createLibraryCopy.mockResolvedValue({ id: "fork_created" });
  mocks.createBlankLibrarySkill.mockResolvedValue({ id: "fork_blank" });
  mocks.persistForkValidation.mockResolvedValue({ ok: true, issues: [] });
  mocks.uniqueLibrarySlug.mockResolvedValue("renamed-skill");
  mocks.validateForkDraftPackage.mockReturnValue({
    skillYml: "id: code-review\n",
    files: [
      { path: "SKILL.md", content: "# Updated" },
      { path: "skill.yml", content: "id: code-review\n" },
    ],
    validation: { ok: true, issues: [] },
    hasBlockingErrors: false,
  });
  mocks.prisma.profile.findFirst.mockResolvedValue(null);
  mocks.prisma.profile.findUnique.mockResolvedValue({ handle: "yaacov" });
  mocks.prisma.profile.update.mockResolvedValue({});
  mocks.prisma.apiToken.create.mockResolvedValue({});
  mocks.prisma.apiToken.updateMany.mockResolvedValue({ count: 1 });
  mocks.prisma.skillFork.findFirst.mockResolvedValue(null);
  mocks.prisma.skillFork.update.mockReturnValue({ op: "update-fork" });
  mocks.prisma.skillForkFile.upsert.mockReturnValue({ op: "upsert-file" });
  mocks.prisma.$transaction.mockResolvedValue([]);
});

describe("dashboard server actions", () => {
  it("creates API tokens for the session user and shows the raw token once", async () => {
    const { createTokenAction } = await import("./actions");
    const formData = new FormData();
    formData.set("name", "Test laptop");

    const result = await createTokenAction({}, formData);

    expect(result).toEqual({ token: "psk_test_raw" });
    expect(mocks.prisma.apiToken.create).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        name: "Test laptop",
        prefix: "psk_test_raw",
        tokenHash: "hashed-token",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("revokes only tokens owned by the session user", async () => {
    const { revokeTokenAction } = await import("./actions");
    const formData = new FormData();
    formData.set("tokenId", "token_456");

    await revokeTokenAction(formData);

    expect(mocks.prisma.apiToken.updateMany).toHaveBeenCalledWith({
      where: { id: "token_456", userId: "user_123" },
      data: { revokedAt: expect.any(Date) },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("copies visible skills into a private library item by default", async () => {
    const { copySkillToLibraryAction } = await import("./actions");
    const formData = new FormData();
    formData.set("reference", "official/code-review");

    await expect(copySkillToLibraryAction(formData)).rejects.toMatchObject({
      path: "/dashboard/library/fork_created/edit",
    });

    expect(mocks.createLibraryCopy).toHaveBeenCalledWith({
      reference: "official/code-review",
      user,
      visibility: SkillVisibility.PRIVATE,
    });
    expect(mocks.ensureProfile).toHaveBeenCalledWith(user);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/library");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/u/yaacov");
  });

  it("does not persist invalid fork edits", async () => {
    const { saveForkAction } = await import("./actions");
    mocks.prisma.skillFork.findFirst.mockResolvedValue({
      id: "fork_123",
      ownerId: "user_123",
      slug: "code-review",
      version: "0.1.0",
      license: "MIT",
      categories: ["coding"],
      tags: ["review"],
      compatibleWith: ["generic-agent"],
      installTargets: {},
      publishedAt: null,
      files: [
        { path: "SKILL.md", content: "# Old" },
        { path: "skill.yml", content: "id: code-review\n" },
      ],
    });
    mocks.validateForkDraftPackage.mockReturnValue({
      skillYml: "",
      files: [],
      validation: {
        ok: false,
        issues: [
          {
            level: "error",
            code: "invalid-package",
            message: "Invalid package metadata.",
          },
        ],
      },
      hasBlockingErrors: true,
    });
    const formData = new FormData();
    formData.set("forkId", "fork_123");
    formData.set("slug", "code-review");
    formData.set("name", "Code Review");
    formData.set("summary", "Review code changes for regressions.");
    formData.set("description", "Review code changes before promotion.");
    formData.set("skillMarkdown", "# Updated");
    formData.set("visibility", "PUBLIC");

    const result = await saveForkAction({}, formData);

    expect(result).toEqual({
      error: "Fix validation errors before saving this skill.",
      issues: [
        {
          level: "error",
          code: "invalid-package",
          message: "Invalid package metadata.",
        },
      ],
    });
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
    expect(mocks.persistForkValidation).not.toHaveBeenCalled();
  });

  it("saves valid fork edits only for a fork owned by the session user", async () => {
    const { saveForkAction } = await import("./actions");
    mocks.prisma.skillFork.findFirst.mockResolvedValue({
      id: "fork_123",
      ownerId: "user_123",
      slug: "code-review",
      version: "0.1.0",
      license: "MIT",
      categories: ["coding"],
      tags: ["review"],
      compatibleWith: ["generic-agent"],
      installTargets: { codex: "~/.codex/skills/code-review" },
      publishedAt: null,
      files: [
        { path: "SKILL.md", content: "# Old" },
        { path: "skill.yml", content: "id: code-review\n" },
      ],
    });
    const formData = new FormData();
    formData.set("forkId", "fork_123");
    formData.set("slug", "renamed-skill");
    formData.set("name", "Renamed Skill");
    formData.set("summary", "Review code changes for regressions.");
    formData.set("description", "Review code changes before promotion.");
    formData.set("skillMarkdown", "# Updated");
    formData.set("visibility", "PUBLIC");

    const result = await saveForkAction({}, formData);

    expect(mocks.prisma.skillFork.findFirst).toHaveBeenCalledWith({
      where: { id: "fork_123", ownerId: "user_123" },
      include: { files: true },
    });
    expect(mocks.uniqueLibrarySlug).toHaveBeenCalledWith("user_123", "renamed-skill");
    expect(mocks.prisma.skillFork.update).toHaveBeenCalledWith({
      where: { id: "fork_123" },
      data: expect.objectContaining({
        slug: "renamed-skill",
        visibility: SkillVisibility.PUBLIC,
        publishedAt: expect.any(Date),
      }),
    });
    expect(mocks.prisma.$transaction).toHaveBeenCalledWith([
      { op: "update-fork" },
      { op: "upsert-file" },
      { op: "upsert-file" },
    ]);
    expect(mocks.persistForkValidation).toHaveBeenCalledWith("fork_123", [
      { path: "SKILL.md", content: "# Updated" },
      { path: "skill.yml", content: "id: code-review\n" },
    ]);
    expect(result).toEqual({ ok: true, issues: [] });
  });
});
