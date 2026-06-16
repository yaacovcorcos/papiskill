import { SkillVisibility } from "@prisma/client";

type ForkReadCondition =
  | { visibility: SkillVisibility }
  | { ownerId: string };

export function readableForkVisibilityWhere(actorId?: string | null): ForkReadCondition[] {
  const conditions: ForkReadCondition[] = [
    { visibility: SkillVisibility.PUBLIC },
  ];

  if (actorId) {
    conditions.push({ ownerId: actorId });
  }

  return conditions;
}
