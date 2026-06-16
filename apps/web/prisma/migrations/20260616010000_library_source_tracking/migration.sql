ALTER TABLE "SkillFork"
ADD COLUMN "sourceForkId" TEXT,
ADD COLUMN "sourceReference" TEXT,
ADD COLUMN "sourceVersion" TEXT,
ADD COLUMN "sourcePackageHash" TEXT,
ADD COLUMN "lastValidatedAt" TIMESTAMP(3),
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "SkillFork_ownerId_archivedAt_updatedAt_idx" ON "SkillFork"("ownerId", "archivedAt", "updatedAt");
CREATE INDEX "SkillFork_sourceForkId_idx" ON "SkillFork"("sourceForkId");

ALTER TABLE "SkillFork"
ADD CONSTRAINT "SkillFork_sourceForkId_fkey"
FOREIGN KEY ("sourceForkId") REFERENCES "SkillFork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
