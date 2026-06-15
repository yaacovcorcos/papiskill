import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { getSessionUser } from "@/lib/server/request-auth";
import { ensureProfile } from "@/lib/server/profiles";
import { getPrisma } from "@/lib/server/prisma";
import { revokeTokenAction } from "./actions";
import { TokenForm } from "./token-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const profile = user ? await ensureProfile(user) : null;
  const [forks, tokens] = user
    ? await Promise.all([
        getPrisma().skillFork.findMany({
          where: { ownerId: user.id },
          orderBy: { updatedAt: "desc" },
          include: { validations: true },
        }),
        getPrisma().apiToken.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
              {profile ? `Signed in as ${profile.handle}. Manage profile skills, private forks, API tokens, validation, and downloads.` : "Manage profile skills, private forks, API tokens, validation, and downloads."}
            </p>
          </div>
          {!user ? (
            <Link href="/api/auth/sign-in/github" className="inline-flex justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Sign in with GitHub
            </Link>
          ) : null}
        </div>
        {user ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your forks</h2>
                <Link href="/skills" className="text-sm font-medium text-accent hover:underline">Fork a skill</Link>
              </div>
              <div className="mt-4 divide-y divide-border">
                {forks.length === 0 ? (
                  <p className="py-8 text-sm text-muted">No forks yet. Open any skill and choose Fork.</p>
                ) : forks.map((fork) => (
                  <div key={fork.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <Link href={`/dashboard/skills/${fork.id}/edit`} className="font-semibold hover:underline">{fork.name}</Link>
                      <p className="mt-1 text-sm text-muted">{fork.visibility.toLowerCase()} · {fork.validations.length} validation notes</p>
                    </div>
                    <Link href={`/dashboard/skills/${fork.id}/edit`} className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Edit</Link>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-6">
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
              ["Forks", "Edit your public or private skill copies."],
              ["API tokens", "Create tokens for authenticated private CLI installs."],
              ["Publishing", "Submit validated packages for global registry review."],
            ].map(([title, body]) => (
              <section key={title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
