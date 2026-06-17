import { AppHeader } from "@/components/app-header";
import { GithubSignInButton } from "@/components/github-sign-in-button";
import { localCallbackPath } from "@/lib/auth-callback";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const callbackURL = localCallbackPath(params.callbackURL);
  const authMessage = signInMessage(params.reason);

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Sign in to PapiSkill</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Use GitHub to manage your profile, private library skills, and CLI tokens.
        </p>
        {authMessage ? (
          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {authMessage}
          </p>
        ) : null}
        <GithubSignInButton callbackURL={callbackURL} className="mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" />
      </main>
    </>
  );
}

function signInMessage(reason: string | undefined) {
  if (reason === "auth_not_configured") {
    return "GitHub sign-in is not configured in this local environment. Public browsing still works, but account features need the deployed auth/database settings.";
  }
  if (reason === "auth_unavailable") {
    return "GitHub sign-in did not start successfully. Please try again in a moment.";
  }
  return null;
}
