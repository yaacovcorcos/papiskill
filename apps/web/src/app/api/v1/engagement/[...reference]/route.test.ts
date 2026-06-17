import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  getSkillEngagement: vi.fn(),
}));

vi.mock("@/lib/server/request-auth", () => ({
  getSessionUser: mocks.getSessionUser,
}));

vi.mock("@/lib/server/engagement", () => ({
  getSkillEngagement: mocks.getSkillEngagement,
}));

describe("GET /api/v1/engagement/[...reference]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSessionUser.mockResolvedValue(null);
    mocks.getSkillEngagement.mockResolvedValue({
      enabled: true,
      reference: "official/code-review",
      path: "/skills/official/code-review",
      starCount: 2,
      commentCount: 1,
      viewerHasStarred: false,
      comments: [
        {
          id: "comment_1",
          body: "Great skill.",
          createdAt: new Date("2026-06-17T12:00:00.000Z"),
          authorHandle: "alice",
          authorName: "Alice",
          authorAvatarUrl: null,
          viewerCanDelete: false,
          viewerCanHide: false,
        },
      ],
    });
  });

  it("returns serialized engagement and no-store cache headers", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request("https://papiskill.test/api/v1/engagement/official/code-review"),
      { params: Promise.resolve({ reference: ["official", "code-review"] }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      engagement: {
        enabled: true,
        reference: "official/code-review",
        path: "/skills/official/code-review",
        starCount: 2,
        commentCount: 1,
        viewerHasStarred: false,
        comments: [
          {
            id: "comment_1",
            body: "Great skill.",
            createdAt: "2026-06-17T12:00:00.000Z",
            authorHandle: "alice",
            authorName: "Alice",
            authorAvatarUrl: null,
            viewerCanDelete: false,
            viewerCanHide: false,
          },
        ],
      },
      viewerSignedIn: false,
    });
  });

  it("passes the signed-in viewer to engagement lookup", async () => {
    mocks.getSessionUser.mockResolvedValue({ id: "user_1" });
    const { GET } = await import("./route");

    await GET(
      new Request("https://papiskill.test/api/v1/engagement/official/code-review"),
      { params: Promise.resolve({ reference: ["official", "code-review"] }) },
    );

    expect(mocks.getSkillEngagement).toHaveBeenCalledWith(
      "official/code-review",
      { id: "user_1" },
    );
  });
});
