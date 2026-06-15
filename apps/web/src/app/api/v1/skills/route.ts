import { jsonResponse } from "@/lib/server/http";
import { getCatalogSkills } from "@/lib/server/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const skills = await getCatalogSkills(q);
  return jsonResponse({ skills });
}
