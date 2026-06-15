import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getSessionUser } from "@/lib/server/request-auth";
import { getPrisma } from "@/lib/server/prisma";
import { saveForkAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditForkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) notFound();

  const { id } = await params;
  const fork = await getPrisma().skillFork.findFirst({
    where: { id, ownerId: user.id },
    include: {
      files: true,
      validations: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!fork) notFound();

  const markdown = fork.files.find((file) => file.path === "SKILL.md")?.content ?? "";

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Edit {fork.name}</h1>
          <p className="mt-2 text-muted">Save updates, run validation, and download or install your profile copy.</p>
        </div>
        <form action={saveForkAction} className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <input type="hidden" name="forkId" value={fork.id} />
          <section className="space-y-4 rounded-lg border border-border bg-white p-5 shadow-sm">
            <Field label="Name" name="name" defaultValue={fork.name} />
            <Field label="Summary" name="summary" defaultValue={fork.summary} />
            <label className="block text-sm font-medium">
              Description
              <textarea name="description" defaultValue={fork.description} rows={5} className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm font-medium">
              Visibility
              <select name="visibility" defaultValue={fork.visibility} className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm">
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public profile skill</option>
                <option value="UNLISTED">Unlisted</option>
              </select>
            </label>
            <button type="submit" className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save and validate</button>
            <div className="border-t border-border pt-4">
              <h2 className="text-sm font-semibold">Validation</h2>
              {fork.validations.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No validation notes yet.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-sm">
                  {fork.validations.map((issue) => (
                    <li key={issue.id} className="rounded-md border border-border bg-slate-50 p-2">
                      <span className="font-semibold">{issue.level}</span> {issue.code}: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold">
              SKILL.md
              <textarea
                name="skillMarkdown"
                defaultValue={markdown}
                rows={28}
                spellCheck={false}
                className="mt-3 w-full rounded-md border border-border bg-slate-50 px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-accent"
              />
            </label>
          </section>
        </form>
      </main>
    </>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} defaultValue={defaultValue} className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" />
    </label>
  );
}
