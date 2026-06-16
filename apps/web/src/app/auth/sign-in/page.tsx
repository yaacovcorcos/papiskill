import { AppHeader } from "@/components/app-header";
import { GithubSignInButton } from "@/components/github-sign-in-button";

export default function SignInPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Sign in to PapiSkill</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Use GitHub to manage your profile, private library skills, and CLI tokens.
        </p>
        <GithubSignInButton className="mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" />
      </main>
    </>
  );
}
