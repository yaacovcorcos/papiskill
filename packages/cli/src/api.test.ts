import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSkill, searchSkills } from "./api.js";
import type { CliConfig } from "./config.js";

const config: CliConfig = {
  apiUrl: "https://api.papiskill.test",
  token: "papi_token",
};

describe("PapiSkill API client", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends authenticated search requests and parses CLI skill summaries", async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      skills: [{
        id: "code-review",
        slug: "code-review",
        name: "Code Review",
        summary: "Review code changes for bugs, risks, and missing tests.",
        author: "papiskill",
        registryKind: "global",
        visibility: "public",
        compatibleWith: ["codex", "claude-code", "cursor", "generic-agent"],
        tags: ["review"],
      }],
    }));

    const skills = await searchSkills(config, "review");

    expect(skills).toHaveLength(1);
    expect(skills[0]?.slug).toBe("code-review");
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://api.papiskill.test/api/v1/skills?q=review");
    expect(init.headers).toMatchObject({
      authorization: "Bearer papi_token",
      accept: "application/json",
    });
  });

  it("parses detailed skill payloads used by install and download commands", async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      id: "code-review",
      slug: "code-review",
      name: "Code Review",
      summary: "Review code changes for bugs, risks, and missing tests.",
      description: "Portable review workflow.",
      author: null,
      registryKind: "global",
      visibility: "public",
      compatibleWith: ["generic-agent"],
      tags: ["review"],
      markdown: "# Code Review\n",
      files: [
        { path: "SKILL.md", content: "# Code Review\n" },
        { path: "skill.yml", content: "id: code-review\n" },
      ],
      installTargets: {
        "generic-agent": "./skills/code-review",
      },
    }));

    const skill = await getSkill(config, "official/code-review");

    expect(skill.files.map((file) => file.path)).toEqual(["SKILL.md", "skill.yml"]);
    expect(skill.installTargets["generic-agent"]).toBe("./skills/code-review");
  });

  it("rejects malformed API payloads instead of installing unknown shapes", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ skills: [{ slug: "missing-fields" }] }));

    await expect(searchSkills(config, "")).rejects.toThrow();
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
