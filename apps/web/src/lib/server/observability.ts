type WarningContextValue = boolean | number | string | null | undefined;

export type ServerWarningContext = Record<string, WarningContextValue>;

interface SerializedWarningError {
  name: string;
  message: string;
  code?: string;
}

const maxLoggedStringLength = 300;
const redactions: Array<[RegExp, string]> = [
  [/\bpsk_[A-Za-z0-9_-]+/g, "[redacted-token]"],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]"],
  [/\b(postgres(?:ql)?:\/\/)[^:\s/@]+:[^@\s]+@/gi, "$1[redacted]@"],
  [/\b(https?:\/\/)[^:\s/@]+:[^@\s]+@/gi, "$1[redacted]@"],
  [/\b(password|secret|token|api[_-]?key)=([^&\s]+)/gi, "$1=[redacted]"],
];

export function logServerWarning(
  operation: string,
  error: unknown,
  context: ServerWarningContext = {},
) {
  console.warn("[papiskill.server.warning]", {
    operation,
    context: sanitizeContext(context),
    error: serializeWarningError(error),
  });
}

export function serializeWarningError(error: unknown): SerializedWarningError {
  if (error instanceof Error) {
    return {
      name: sanitizeText(error.name || "Error"),
      message: sanitizeText(error.message),
      ...errorCode(error),
    };
  }

  return {
    name: "UnknownError",
    message: sanitizeText(String(error)),
  };
}

function errorCode(error: Error): { code?: string } {
  const code = (error as Error & { code?: unknown }).code;
  if (typeof code === "string" || typeof code === "number") {
    return { code: sanitizeText(String(code)) };
  }
  return {};
}

function sanitizeContext(context: ServerWarningContext): ServerWarningContext {
  return Object.fromEntries(
    Object.entries(context)
      .filter((entry): entry is [string, Exclude<WarningContextValue, undefined>] => entry[1] !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string" ? sanitizeText(value) : value,
      ]),
  );
}

function sanitizeText(value: string): string {
  const redacted = redactions.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );
  return redacted.length > maxLoggedStringLength
    ? `${redacted.slice(0, maxLoggedStringLength)}...`
    : redacted;
}
