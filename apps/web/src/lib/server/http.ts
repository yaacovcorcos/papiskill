export const publicCatalogCacheHeaders = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=300",
  "Vercel-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...init?.headers,
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, { status });
}
