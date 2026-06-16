export const publicCatalogCacheHeaders = {
  "cache-control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=300",
  "Vercel-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export const publicHealthCacheHeaders = {
  "cache-control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control": "public, max-age=30, stale-while-revalidate=60",
  "Vercel-CDN-Cache-Control": "public, max-age=30, stale-while-revalidate=60",
};

export const noStoreCacheHeaders = {
  "cache-control": "no-store",
};

export const privateNoStoreCacheHeaders = {
  "cache-control": "private, no-store",
};

export function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: mergeHeaders(noStoreCacheHeaders, init?.headers),
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, { status });
}

export function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();
  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}
