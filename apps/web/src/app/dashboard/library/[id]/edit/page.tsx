import { notFound, redirect } from "next/navigation";
import { SkillVisibility } from "@prisma/client";
import { AppHeader } from "@/components/app-header";
import { signInPath } from "@/lib/auth-callback";
import { canonicalRegistryReference } from "@/lib/references";
import { ensureProfile } from "@/lib/server/profiles";
import { getPrisma } from "@/lib/server/prisma";
import { getSessionUser } from "@/lib/server/request-auth";
import { EditLibrarySkillForm } from "./edit-library-skill-form";

export const dynamic = "force-dynamic";

export default async function EditLibrarySkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath(`/dashboard/library/${id}/edit`));
  }
  const profile = await ensureProfile(user);
  const fork = await getPrisma().skillFork.findFirst({
    where: { id, ownerId: user.id, archivedAt: null },
    include: {
      files: { orderBy: { path: "asc" } },
      validations: { orderBy: { createdAt: "desc" } },
      sourceSkill: { select: { slug: true, name: true, registryKind: true, version: true } },
      sourceFork: {
        select: {
          slug: true,
          name: true,
          version: true,
          owner: { select: { profile: { select: { handle: true } } } },
        },
      },
    },
  });
  if (!fork) notFound();

  const markdown = fork.files.find((file) => file.path === "SKILL.md")?.content ?? "";
  const reference = `${profile.handle}/${fork.slug}`;
  const installCommand = `papiskill install ${reference}`;
  const publicHref = `/u/${profile.handle}/skills/${fork.slug}`;
  const sourceVersion = fork.sourceVersion ?? fork.sourceSkill?.version ?? fork.sourceFork?.version ?? "unknown";
  const initialMarkdownMode = fork.sourceReference || fork.sourceSkill || fork.sourceFork ? "split" : "write";
  const validationIssues = fork.validations.map((issue) => ({
    level: issue.level.toLowerCase() as "error" | "warning",
    code: issue.code,
    message: issue.message,
    ...(issue.path ? { path: issue.path } : {}),
  }));

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <EditLibrarySkillForm
          fork={{
            id: fork.id,
            name: fork.name,
            slug: fork.slug,
            summary: fork.summary,
            description: fork.description,
            visibility: fork.visibility,
            markdown,
          }}
          reference={reference}
          installCommand={installCommand}
          publicHref={publicHref}
          showPublicLink={fork.visibility !== SkillVisibility.PRIVATE}
          sourceLabel={sourceLabel(fork)}
          sourceVersion={sourceVersion}
          lastValidatedAt={fork.lastValidatedAt ? formatDate(fork.lastValidatedAt) : "never"}
          initialMarkdownMode={initialMarkdownMode}
          initialIssues={validationIssues}
        />
      </main>
    </>
  );
}

function sourceLabel(item: {
  sourceReference: string | null;
  sourceSkill: { slug: string; registryKind: string } | null;
  sourceFork: { slug: string; owner: { profile: { handle: string } | null } } | null;
}) {
  if (item.sourceReference) return item.sourceReference;
  if (item.sourceSkill) return canonicalRegistryReference(item.sourceSkill.registryKind.toLowerCase(), item.sourceSkill.slug);
  if (item.sourceFork?.owner.profile) return `${item.sourceFork.owner.profile.handle}/${item.sourceFork.slug}`;
  return "manual";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value);
}
