export function resolveBetterAuthSecret(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.BETTER_AUTH_SECRET?.trim();
  if (secret) return secret;

  if (env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET must be set in production.");
  }

  return "development-only-change-me";
}
