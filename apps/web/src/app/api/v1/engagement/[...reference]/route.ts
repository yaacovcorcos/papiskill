import { errorResponse, jsonResponse } from "@/lib/server/http";
import { getSkillEngagement } from "@/lib/server/engagement";
import { serializeSkillEngagement } from "@/lib/server/engagement-serializers";
import { getSessionUser } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ reference: string[] }> },
) {
  const { reference } = await context.params;
  const joinedReference = reference.join("/");
  if (!joinedReference) {
    return errorResponse("Engagement reference is required.", 400);
  }

  const viewer = await getSessionUser().catch(() => null);
  const engagement = await getSkillEngagement(
    joinedReference,
    viewer ? { id: viewer.id } : null,
  );

  return jsonResponse({
    engagement: serializeSkillEngagement(engagement),
    viewerSignedIn: Boolean(viewer),
  });
}
