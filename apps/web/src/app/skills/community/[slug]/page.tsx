import { generatedRegistry } from "@/lib/server/generated-registry";
import { PublicRegistryDetailPage } from "../../public-registry-detail";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return generatedRegistry
    .filter((skill) => skill.registryKind === "community")
    .map((skill) => ({ slug: skill.slug }));
}

export default async function CommunitySkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicRegistryDetailPage reference={`community/${slug}`} />;
}
