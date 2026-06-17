import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, UserRound } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { signInPath } from "@/lib/auth-callback";
import { ensureProfile } from "@/lib/server/profiles";
import { getSessionUser } from "@/lib/server/request-auth";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath("/dashboard/profile"));
  }
  const profile = await ensureProfile(user);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1 text-sm font-medium text-muted">
              <UserRound className="size-4" aria-hidden />
              Profile
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Manage profile</h1>
            <p className="mt-2 max-w-2xl text-muted">Set the public identity behind your published library skills.</p>
          </div>
          <Link href={`/u/${profile.handle}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
            <ExternalLink className="size-4" aria-hidden />
            View public profile
          </Link>
        </div>
        <ProfileForm profile={profile} />
      </main>
    </>
  );
}
