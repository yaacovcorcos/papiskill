export function localCallbackPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export function signInPath(callbackURL = "/dashboard", reason?: string): string {
  const safeCallbackURL = localCallbackPath(callbackURL);
  const params = new URLSearchParams({ callbackURL: safeCallbackURL });
  if (reason) {
    params.set("reason", reason);
  }
  return `/auth/sign-in?${params.toString()}`;
}
