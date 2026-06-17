import { SkillCommentStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw Object.assign(new Error(`redirect:${path}`), { path });
  }),
  getSessionUser: vi.fn(),
  getPublicEngagementTarget: vi.fn(),
  engagementTargetWhere: vi.fn(),
  engagementRevalidationPaths: vi.fn(),
  engagementPathForReference: vi.fn(),
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    skillComment: {
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
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

vi.mock("@/lib/server/prisma", () => ({
  getPrisma: () => mocks.prisma,
}));

vi.mock("@/lib/server/profiles", () => ({
  ensureProfile: vi.fn(),
}));

vi.mock("@/lib/server/engagement", async () => {
  const actual = await vi.importActual<typeof import("../../lib/server/engagement")>(
    "../../lib/server/engagement",
  );
  return {
    ...actual,
    getPublicEngagementTarget: mocks.getPublicEngagementTarget,
    engagementTargetWhere: mocks.engagementTargetWhere,
    engagementRevalidationPaths: mocks.engagementRevalidationPaths,
    engagementPathForReference: mocks.engagementPathForReference,
  };
});

const user = {
  id: "user_123",
  email: "yaacov@example.com",
  name: "Yaacov",
};

const target = {
  kind: "skill" as const,
  id: "skill_123",
  reference: "official/code-review",
  path: "/skills/official/code-review",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSessionUser.mockResolvedValue(user);
  mocks.getPublicEngagementTarget.mockResolvedValue(target);
  mocks.engagementTargetWhere.mockReturnValue({ skillId: "skill_123" });
  mocks.engagementRevalidationPaths.mockReturnValue([
    "/skills/official/code-review",
    "/skills",
    "/api/v1/skills",
  ]);
  mocks.engagementPathForReference.mockImplementation((reference: string) =>
    reference === "official/missing"
      ? "/skills/official/missing"
      : "/skills/official/code-review",
  );
  mocks.prisma.user.findUnique.mockResolvedValue({ isCurator: true });
  mocks.prisma.skillComment.count.mockResolvedValue(0);
  mocks.prisma.skillComment.findFirst.mockResolvedValue(null);
  mocks.prisma.skillComment.create.mockResolvedValue({ id: "comment_456" });
  mocks.prisma.skillComment.updateMany.mockResolvedValue({ count: 1 });
});

describe("comment creation actions", () => {
  it("returns the created comment id so clients can refresh after every successful post", async () => {
    const { createCommentAction } = await import("./engagement-actions");
    const formData = new FormData();
    formData.set("reference", "official/code-review");
    formData.set("body", "This is useful.");

    const result = await createCommentAction({}, formData);

    expect(result).toEqual({ ok: true, commentId: "comment_456" });
    expect(mocks.prisma.skillComment.create).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        body: "This is useful.",
        skillId: "skill_123",
      },
      select: { id: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/skills/official/code-review");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/skills");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/api/v1/skills");
  });
});

describe("engagement moderation actions", () => {
  it("allows curators to hide visible comments on the current engagement target", async () => {
    const { hideCommentAction } = await import("./engagement-actions");
    const formData = new FormData();
    formData.set("reference", "official/code-review");
    formData.set("commentId", "comment_123");

    await hideCommentAction(formData);

    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user_123" },
      select: { isCurator: true },
    });
    expect(mocks.prisma.skillComment.updateMany).toHaveBeenCalledWith({
      where: {
        id: "comment_123",
        status: SkillCommentStatus.VISIBLE,
        skillId: "skill_123",
      },
      data: {
        status: SkillCommentStatus.HIDDEN,
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/skills/official/code-review");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/skills");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/api/v1/skills");
  });

  it("does not hide comments for non-curator users", async () => {
    const { hideCommentAction } = await import("./engagement-actions");
    mocks.prisma.user.findUnique.mockResolvedValue({ isCurator: false });
    const formData = new FormData();
    formData.set("reference", "official/code-review");
    formData.set("commentId", "comment_123");

    await hideCommentAction(formData);

    expect(mocks.prisma.skillComment.updateMany).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/skills/official/code-review");
  });

  it("redirects back to the requested skill when the moderation target is invalid", async () => {
    const { hideCommentAction } = await import("./engagement-actions");
    mocks.getPublicEngagementTarget.mockResolvedValue(null);
    const formData = new FormData();
    formData.set("reference", "official/missing");
    formData.set("commentId", "comment_123");

    await expect(hideCommentAction(formData)).rejects.toMatchObject({
      path: "/skills/official/missing",
    });
    expect(mocks.prisma.skillComment.updateMany).not.toHaveBeenCalled();
  });
});
