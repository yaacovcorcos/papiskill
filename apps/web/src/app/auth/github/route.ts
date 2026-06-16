import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const callbackURL = localCallbackURL(requestUrl.searchParams.get("callbackURL"));
  const authUrl = new URL("/api/auth/sign-in/social", requestUrl.origin);

  const authResponse = await getAuth().handler(
    new Request(authUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: requestUrl.origin,
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({
        provider: "github",
        callbackURL,
      }),
    }),
  );

  const payload = await authResponse.json().catch(() => null);
  if (!authResponse.ok || !payload?.url) {
    return NextResponse.redirect(new URL("/auth/sign-in", requestUrl.origin));
  }

  const response = NextResponse.redirect(payload.url);
  for (const cookie of getSetCookies(authResponse.headers)) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

function localCallbackURL(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function getSetCookies(headers: Headers): string[] {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  if (getSetCookie) return getSetCookie.call(headers);
  const cookie = headers.get("set-cookie");
  return cookie ? [cookie] : [];
}
