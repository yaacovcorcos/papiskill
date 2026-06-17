import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuth } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/server/db-env";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({
  getAuth: vi.fn(),
}));

vi.mock("@/lib/server/db-env", () => ({
  hasDatabaseUrl: vi.fn(),
}));

const mockGetAuth = vi.mocked(getAuth);
const mockHasDatabaseUrl = vi.mocked(hasDatabaseUrl);

describe("GitHub auth route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves callback context and explains missing auth configuration", async () => {
    mockHasDatabaseUrl.mockReturnValue(false);

    const response = await GET(
      new Request("http://localhost:3000/auth/github?callbackURL=%2Fdashboard%2Flibrary"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/sign-in?callbackURL=%2Fdashboard%2Flibrary&reason=auth_not_configured",
    );
    expect(mockGetAuth).not.toHaveBeenCalled();
  });

  it("falls back to the sign-in page when the provider handoff fails", async () => {
    mockHasDatabaseUrl.mockReturnValue(true);
    mockGetAuth.mockReturnValue({
      handler: vi.fn(async () => Response.json({}, { status: 500 })),
    } as unknown as ReturnType<typeof getAuth>);

    const response = await GET(
      new Request("http://localhost:3000/auth/github?callbackURL=%2Fdashboard%2Ffork%3Fskill%3Dofficial%252Fcode-review"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/sign-in?callbackURL=%2Fdashboard%2Ffork%3Fskill%3Dofficial%252Fcode-review&reason=auth_unavailable",
    );
  });
});
