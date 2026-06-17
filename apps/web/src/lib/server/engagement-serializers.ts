import type { SerializedSkillEngagement } from "@/lib/engagement-types";
import type { SkillEngagement } from "./engagement";

export function serializeSkillEngagement(
  engagement: SkillEngagement,
): SerializedSkillEngagement {
  return {
    ...engagement,
    comments: engagement.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };
}
