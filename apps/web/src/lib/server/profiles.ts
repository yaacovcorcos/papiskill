import type { User } from "@prisma/client";
import { getPrisma } from "./prisma";

const reservedHandles = new Set([
  "api",
  "auth",
  "dashboard",
  "docs",
  "download",
  "global",
  "official",
  "skills",
  "u",
]);

export function deriveHandle(user: Pick<User, "email" | "name" | "id">): string {
  const emailName = githubHandleFromEmail(user.email) || user.email.split("@")[0] || user.name || user.id;
  return emailName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `user-${user.id.slice(0, 8)}`;
}

export function githubHandleFromEmail(email: string): string | null {
  const [localPart, domain] = email.toLowerCase().split("@");
  if (!localPart || domain !== "users.noreply.github.com") return null;

  const plusMatch = localPart.match(/^\d+\+(.+)$/);
  return plusMatch?.[1] || localPart;
}

export function normalizeHandle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function validateHandle(value: string): string | null {
  if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(value)) {
    return "Use 3-32 lowercase letters, numbers, or hyphens.";
  }
  if (reservedHandles.has(value)) {
    return "That handle is reserved.";
  }
  return null;
}

export async function ensureProfile(user: Pick<User, "id" | "email" | "name"> & { image?: string | null }) {
  const prisma = getPrisma();
  const existing = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    return existing;
  }

  const base = deriveHandle(user);
  const githubHandle = githubHandleFromEmail(user.email);
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
          githubUrl: githubHandle ? `https://github.com/${githubHandle}` : null,
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
