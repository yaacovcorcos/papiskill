import Link from "next/link";
import { UserRound } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { getPrisma } from "@/lib/server/prisma";

export const revalidate = 60;

export default async function AuthorsPage() {
  const profiles = await getProfiles();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Authors</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Public author profiles collect published skills, forks, attribution, and contribution history.
        </p>
        {profiles.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-slate-50 p-8 text-sm text-muted">
            Author discovery will populate as GitHub-authenticated users publish public skills.
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {profiles.map((profile) => (
              <Link key={profile.id} href={`/u/${profile.handle}`} className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm hover:border-slate-300">
                <div className="grid size-12 place-items-center overflow-hidden rounded-lg border border-border bg-surface-subtle">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <UserRound className="size-5 text-slate-400" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{profile.name || profile.handle}</h2>
                  <p className="text-sm text-muted">@{profile.handle}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

async function getProfiles() {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await getPrisma().profile.findMany({
      select: {
        id: true,
        handle: true,
        name: true,
        avatarUrl: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
  } catch {
    return [];
  }
}
