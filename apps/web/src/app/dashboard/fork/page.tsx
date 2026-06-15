import { AppHeader } from "@/components/app-header";
import { forkSkillAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ForkPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string }>;
}) {
  const params = await searchParams;
  const reference = params.skill ?? "";

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Fork skill</h1>
        <p className="mt-3 text-muted">Create a profile-owned copy that you can keep private, publish publicly, edit, and install with the CLI.</p>
        <form action={forkSkillAction} className="mt-8 rounded-lg border border-border bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium">
            Source skill
            <input name="reference" defaultValue={reference} className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Visibility
            <select name="visibility" defaultValue="PRIVATE" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm">
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public profile skill</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </label>
          <button type="submit" className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Create fork</button>
        </form>
      </main>
    </>
  );
}
