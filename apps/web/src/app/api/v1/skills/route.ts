import { jsonResponse } from "@/lib/server/http";
import { searchVisibleSkills } from "@/lib/server/skills";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const skills = await searchVisibleSkills(q);
  return jsonResponse({ skills });
}
