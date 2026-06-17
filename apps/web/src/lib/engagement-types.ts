export interface SerializedSkillEngagementComment {
  id: string;
  body: string;
  createdAt: string;
  authorHandle: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  viewerCanDelete: boolean;
  viewerCanHide: boolean;
}

export interface SerializedSkillEngagement {
  enabled: boolean;
  reference: string;
  path: string;
  starCount: number;
  commentCount: number;
  viewerHasStarred: boolean;
  comments: SerializedSkillEngagementComment[];
}
