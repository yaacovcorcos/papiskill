import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { hashApiToken } from "@/lib/server/tokens";
import { getPrisma } from "./prisma";

export async function getSessionUser() {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === "development") {
    return null;
  }

  const session = await getAuth().api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}

export async function getTokenUser(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  const tokenHash = hashApiToken(token);
  const apiToken = await getPrisma().apiToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: { user: true },
  });

  if (!apiToken) {
    return null;
  }

  await getPrisma().apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() },
  });

  return apiToken.user;
}
