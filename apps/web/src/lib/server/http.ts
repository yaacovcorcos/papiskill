export const publicCatalogCacheHeaders = {
  "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
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
