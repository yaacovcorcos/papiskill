import type { User } from "@prisma/client";
import { getPrisma } from "./prisma";

export function deriveHandle(user: Pick<User, "email" | "name" | "id">): string {
  const emailName = user.email.split("@")[0] || user.name || user.id;
  return emailName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `user-${user.id.slice(0, 8)}`;
}

export async function ensureProfile(user: Pick<User, "id" | "email" | "name" | "image">) {
  const prisma = getPrisma();
  const existing = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    return existing;
  }

  const base = deriveHandle(user);
  let handle = base;
  for (let attempt = 1; attempt < 20; attempt += 1) {
    const taken = await prisma.profile.findUnique({ where: { handle } });
    if (!taken) {
      return prisma.profile.create({
        data: {
          userId: user.id,
          handle,
          name: user.name,
          avatarUrl: user.image,
          githubUrl: `https://github.com/${handle}`,
        },
      });
    }
    handle = `${base}-${attempt + 1}`;
  }

  return prisma.profile.create({
    data: {
      userId: user.id,
      handle: `${base}-${user.id.slice(0, 8)}`,
      name: user.name,
      avatarUrl: user.image,
    },
  });
}
