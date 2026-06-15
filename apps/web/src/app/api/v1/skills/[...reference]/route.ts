import { errorResponse, jsonResponse } from "@/lib/server/http";
import { getTokenUser } from "@/lib/server/request-auth";
import { getSkillByReference } from "@/lib/server/skills";

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string[] }> },
) {
  const { reference } = await context.params;
  const actor = await getTokenUser(request);
  const skill = await getSkillByReference(reference.join("/"), actor);
  if (!skill) {
    return errorResponse("Skill not found.", 404);
  }
  return jsonResponse(skill);
}
