import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createApiToken(): { rawToken: string; prefix: string; tokenHash: string } {
  const rawToken = `psk_${randomBytes(32).toString("base64url")}`;
  return {
    rawToken,
    prefix: rawToken.slice(0, 12),
    tokenHash: hashApiToken(rawToken),
  };
}

export function hashApiToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function safeTokenEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}
