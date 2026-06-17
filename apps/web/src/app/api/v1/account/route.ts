import { jsonResponse } from "@/lib/server/http";
import { ensureProfile } from "@/lib/server/profiles";
import { getSessionUser } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser().catch(() => null);
  if (!user) {
    return jsonResponse({ signedIn: false });
  }

  const profile = await ensureProfile(user);
  return jsonResponse({
    signedIn: true,
    user: {
      name: user.name,
      image: user.image ?? null,
    },
    profile: {
      handle: profile.handle,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    },
  });
}
