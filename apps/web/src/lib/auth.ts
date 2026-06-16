import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getAppUrl } from "@/lib/server/app-url";
import { getPrisma } from "@/lib/server/prisma";
import { resolveBetterAuthSecret } from "./auth-secret";

function createAuth() {
  const hasGitHubProvider = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  );

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || getAppUrl(),
    secret: resolveBetterAuthSecret(),
    trustedOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://papiskill.com",
      getAppUrl(),
    ],
    database: prismaAdapter(getPrisma(), {
      provider: "postgresql",
    }),
    advanced: {
      ipAddress: {
        ipAddressHeaders: [
          "x-vercel-forwarded-for",
          "x-forwarded-for",
          "x-real-ip",
          "cf-connecting-ip",
        ],
      },
    },
    socialProviders: hasGitHubProvider
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            mapProfileToUser(profile) {
              const login = typeof profile.login === "string" ? profile.login : undefined;
              const fallbackEmail = login ? `${login}@users.noreply.github.com` : undefined;
              return {
                name: profile.name || login || "PapiSkill user",
                email: profile.email || fallbackEmail,
                image: profile.avatar_url,
              };
            },
          },
        }
      : undefined,
    plugins: [nextCookies()],
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}

export type AuthSession = AuthInstance["$Infer"]["Session"];
