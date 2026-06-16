import Link from "next/link";
import { BookOpen, ExternalLink, Library, UserRound } from "lucide-react";
import { SkillVisibility } from "@prisma/client";
import { AppHeader } from "@/components/app-header";
import { GithubSignInButton } from "@/components/github-sign-in-button";
import { getPrisma } from "@/lib/server/prisma";
import { ensureProfile } from "@/lib/server/profiles";
import { getSessionUser } from "@/lib/server/request-auth";
import { revokeTokenAction } from "./actions";
import { TokenForm } from "./token-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const profile = user ? await ensureProfile(user) : null;
  const [libraryItems, tokens] = user
    ? await Promise.all([
        getPrisma().skillFork.findMany({
          where: { ownerId: user.id, archivedAt: null },
          orderBy: { updatedAt: "desc" },
          include: { validations: true },
          take: 6,
        }),
        getPrisma().apiToken.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  const publicCount = libraryItems.filter((item) => item.visibility === SkillVisibility.PUBLIC).length;
  const privateCount = libraryItems.filter((item) => item.visibility === SkillVisibility.PRIVATE).length;

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
              {profile
                ? `Signed in as ${profile.handle}. Manage your profile, saved skill library, editor drafts, and CLI access.`
                : "Sign in to create a profile, save modified skills to your library, and install private copies with the CLI."}
            </p>
          </div>
          {!user ? (
            <GithubSignInButton className="inline-flex justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" showIcon={false} />
          ) : null}
        </div>

        {user && profile ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Library</h2>
                  <p className="mt-1 text-sm text-muted">Profile-owned skill copies you can keep private, publish, edit, download, or install.</p>
                </div>
                <Link href="/dashboard/library" className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  Open library
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Stat label="Saved" value={libraryItems.length.toString()} />
                <Stat label="Public" value={publicCount.toString()} />
                <Stat label="Private" value={privateCount.toString()} />
              </div>

              <div className="mt-5 divide-y divide-border">
                {libraryItems.length === 0 ? (
                  <p className="py-8 text-sm text-muted">No library items yet. Open any skill and choose Copy to library.</p>
                ) : libraryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <Link href={`/dashboard/library/${item.id}/edit`} className="font-semibold hover:underline">{item.name}</Link>
                      <p className="mt-1 text-sm text-muted">
                        {item.visibility.toLowerCase()} · {item.validations.length} validation notes · {item.slug}
                      </p>
                    </div>
                    <Link href={`/dashboard/library/${item.id}/edit`} className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Edit</Link>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
                    <UserRound className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Profile</h2>
                    <p className="mt-1 text-sm text-muted">Your public page is where published library items appear.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <Link href="/dashboard/profile" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                    <UserRound className="size-4" aria-hidden />
                    Edit profile
                  </Link>
                  <Link href={`/u/${profile.handle}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                    <ExternalLink className="size-4" aria-hidden />
                    View public profile
                  </Link>
                </div>
              </section>

              <TokenForm />
              <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Existing tokens</h2>
                <div className="mt-4 space-y-3">
                  {tokens.length === 0 ? <p className="text-sm text-muted">No tokens yet.</p> : tokens.map((token) => (
                    <form key={token.id} action={revokeTokenAction} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                      <input type="hidden" name="tokenId" value={token.id} />
                      <div>
                        <p className="text-sm font-medium">{token.name}</p>
                        <p className="text-xs text-muted">{token.prefix} · {token.revokedAt ? "revoked" : "active"}</p>
                      </div>
                      {!token.revokedAt ? (
                        <button className="text-sm font-semibold text-red-700" type="submit">Revoke</button>
                      ) : null}
                    </form>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { Icon: Library, title: "Library", body: "Save modified copies of skills to your profile." },
              { Icon: UserRound, title: "Profile", body: "Publish selected skills under a public handle." },
              { Icon: BookOpen, title: "CLI", body: "Install public skills and your own private copies." },
            ].map(({ Icon, title, body }) => (
              <section key={title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <Icon className="size-5 text-slate-500" aria-hidden />
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-subtle p-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
