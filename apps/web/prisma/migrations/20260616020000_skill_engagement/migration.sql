CREATE TYPE "SkillCommentStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'DELETED');

ALTER TABLE "SkillStar" ALTER COLUMN "skillId" DROP NOT NULL;
ALTER TABLE "SkillStar" ADD COLUMN "forkId" TEXT;

CREATE TABLE "SkillComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT,
    "forkId" TEXT,
    "body" TEXT NOT NULL,
    "status" "SkillCommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillComment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SkillStar_userId_forkId_key" ON "SkillStar"("userId", "forkId");
CREATE INDEX "SkillStar_forkId_createdAt_idx" ON "SkillStar"("forkId", "createdAt");

CREATE INDEX "SkillComment_skillId_status_createdAt_idx" ON "SkillComment"("skillId", "status", "createdAt");
CREATE INDEX "SkillComment_forkId_status_createdAt_idx" ON "SkillComment"("forkId", "status", "createdAt");
CREATE INDEX "SkillComment_userId_createdAt_idx" ON "SkillComment"("userId", "createdAt");

ALTER TABLE "SkillStar" ADD CONSTRAINT "SkillStar_forkId_fkey" FOREIGN KEY ("forkId") REFERENCES "SkillFork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillComment" ADD CONSTRAINT "SkillComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillComment" ADD CONSTRAINT "SkillComment_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillComment" ADD CONSTRAINT "SkillComment_forkId_fkey" FOREIGN KEY ("forkId") REFERENCES "SkillFork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SkillStar" ADD CONSTRAINT "SkillStar_exactly_one_target" CHECK (
  (CASE WHEN "skillId" IS NULL THEN 0 ELSE 1 END) +
  (CASE WHEN "forkId" IS NULL THEN 0 ELSE 1 END) = 1
);

ALTER TABLE "SkillComment" ADD CONSTRAINT "SkillComment_exactly_one_target" CHECK (
  (CASE WHEN "skillId" IS NULL THEN 0 ELSE 1 END) +
  (CASE WHEN "forkId" IS NULL THEN 0 ELSE 1 END) = 1
);
