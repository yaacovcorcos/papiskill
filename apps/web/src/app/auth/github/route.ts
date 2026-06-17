import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { localCallbackPath, signInPath } from "@/lib/auth-callback";
import { hasDatabaseUrl } from "@/lib/server/db-env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const callbackURL = localCallbackPath(requestUrl.searchParams.get("callbackURL"));
  if (!hasDatabaseUrl()) {
    return NextResponse.redirect(new URL(signInPath(callbackURL, "auth_not_configured"), requestUrl.origin));
  }

  const authUrl = new URL("/api/auth/sign-in/social", requestUrl.origin);

  const authResponse = await getAuth().handler(
    new Request(authUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: requestUrl.origin,
        cookie: request.headers.get("cookie") ?? "",
        ...forwardedIpHeaders(request.headers),
      },
      body: JSON.stringify({
        provider: "github",
        callbackURL,
      }),
    }),
  );

  const payload = await authResponse.json().catch(() => null);
  if (!authResponse.ok || !payload?.url) {
    return NextResponse.redirect(new URL(signInPath(callbackURL, "auth_unavailable"), requestUrl.origin));
  }

  const response = NextResponse.redirect(payload.url);
  for (const cookie of getSetCookies(authResponse.headers)) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

function getSetCookies(headers: Headers): string[] {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  if (getSetCookie) return getSetCookie.call(headers);
  const cookie = headers.get("set-cookie");
  return cookie ? [cookie] : [];
}

function forwardedIpHeaders(headers: Headers): Record<string, string> {
  const forwarded: Record<string, string> = {};
  for (const name of [
    "x-vercel-forwarded-for",
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
  ]) {
    const value = headers.get(name);
    if (value) forwarded[name] = value;
  }
  return forwarded;
}
