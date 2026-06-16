import { DownloadSubjectType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  downloadEventData,
  hashRequestIp,
  requestIp,
} from "./download-events";

describe("download event helpers", () => {
  it("extracts the first forwarded IP address", () => {
    const request = new Request("https://papiskill.com/download/official/code-review", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      },
    });

    expect(requestIp(request)).toBe("203.0.113.10");
  });

  it("hashes IP addresses without exposing raw values", () => {
    const request = new Request("https://papiskill.com/download/official/code-review", {
      headers: {
        "cf-connecting-ip": "203.0.113.20",
      },
    });

    const hash = hashRequestIp(request, "test-secret");
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("203.0.113.20");
    expect(hashRequestIp(request, "test-secret")).toBe(hash);
  });

  it("builds skill and fork download event data", () => {
    const request = new Request("https://papiskill.com/download/official/code-review", {
      headers: {
        "user-agent": "papiskill-cli/0.1.0",
        "x-real-ip": "203.0.113.30",
      },
    });

    expect(downloadEventData({ kind: "skill", id: "skill_123" }, request, null)).toMatchObject({
      userId: null,
      skillId: "skill_123",
      forkId: null,
      subjectType: DownloadSubjectType.SKILL,
      userAgent: "papiskill-cli/0.1.0",
    });
    expect(downloadEventData({ kind: "fork", id: "fork_123" }, request, { id: "user_123" })).toMatchObject({
      userId: "user_123",
      skillId: null,
      forkId: "fork_123",
      subjectType: DownloadSubjectType.FORK,
    });
  });
});
