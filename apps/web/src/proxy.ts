import { NextResponse, type NextRequest } from "next/server";

const canonicalHost = "papiskill.com";
const redirectHosts = new Set(["www.papiskill.com"]);

export function proxy(request: NextRequest) {
  if (!redirectHosts.has(request.nextUrl.hostname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.hostname = canonicalHost;
  return NextResponse.redirect(url, 308);
}
