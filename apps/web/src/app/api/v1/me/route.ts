import { errorResponse, jsonResponse } from "@/lib/server/http";
import { getTokenUser } from "@/lib/server/request-auth";
import { ensureProfile } from "@/lib/server/profiles";

export async function GET(request: Request) {
  const user = await getTokenUser(request);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }
  const profile = await ensureProfile(user);
  return jsonResponse({
    handle: profile.handle,
    name: profile.name,
  });
}
