import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  ensureProfile: vi.fn(),
}));

vi.mock("@/lib/server/request-auth", () => ({
  getSessionUser: mocks.getSessionUser,
}));

vi.mock("@/lib/server/profiles", () => ({
  ensureProfile: mocks.ensureProfile,
}));

describe("account API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a signed-out account payload without creating a profile", async () => {
    mocks.getSessionUser.mockResolvedValue(null);
    const { GET } = await import("./route");

    const response = await GET();
    const payload = await response.json();

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload).toEqual({ signedIn: false });
    expect(mocks.ensureProfile).not.toHaveBeenCalled();
  });

  it("returns signed-in account display data and keeps private identity fields out of the header payload", async () => {
    const user = {
      id: "user_123",
      name: "Yaacov",
      email: "yaacov@example.com",
      image: "https://example.com/avatar.png",
    };
    mocks.getSessionUser.mockResolvedValue(user);
    mocks.ensureProfile.mockResolvedValue({
      handle: "yaacovcorcos",
      name: "Yaacov Corcos",
      avatarUrl: null,
    });
    const { GET } = await import("./route");

    const response = await GET();
    const payload = await response.json();

    expect(mocks.ensureProfile).toHaveBeenCalledWith(user);
    expect(payload).toEqual({
      signedIn: true,
      user: {
        name: "Yaacov",
        image: "https://example.com/avatar.png",
      },
      profile: {
        handle: "yaacovcorcos",
        name: "Yaacov Corcos",
        avatarUrl: null,
      },
    });
    expect(JSON.stringify(payload)).not.toContain("yaacov@example.com");
  });
});
