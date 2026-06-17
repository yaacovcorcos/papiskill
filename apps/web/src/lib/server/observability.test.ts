import { afterEach, describe, expect, it, vi } from "vitest";
import { logServerWarning, serializeWarningError } from "./observability";

describe("server observability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs structured warnings with sanitized context and errors", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = Object.assign(
      new Error("Failed postgresql://user:secret@example.com/db?token=abc with Bearer abc.def and psk_123"),
      { code: "P2002" },
    );

    logServerWarning("test.operation", error, {
      reference: "official/code-review",
      authorization: "Bearer raw-token",
      omitted: undefined,
    });

    expect(warn).toHaveBeenCalledWith("[papiskill.server.warning]", {
      operation: "test.operation",
      context: {
        reference: "official/code-review",
        authorization: "Bearer [redacted]",
      },
      error: {
        name: "Error",
        message: "Failed postgresql://[redacted]@example.com/db?token=[redacted] with Bearer [redacted] and [redacted-token]",
        code: "P2002",
      },
    });
  });

  it("serializes non-error throw values without leaking token-like content", () => {
    expect(serializeWarningError("psk_secret token=value")).toEqual({
      name: "UnknownError",
      message: "[redacted-token] token=[redacted]",
    });
  });
});
