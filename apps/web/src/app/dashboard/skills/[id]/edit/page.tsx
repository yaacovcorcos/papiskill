import { redirect } from "next/navigation";

export default async function LegacyEditForkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/library/${id}/edit`);
}
