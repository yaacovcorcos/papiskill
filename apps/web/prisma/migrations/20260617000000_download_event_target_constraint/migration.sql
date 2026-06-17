ALTER TABLE "DownloadEvent" ADD CONSTRAINT "DownloadEvent_exactly_one_target" CHECK (
  (CASE WHEN "skillId" IS NULL THEN 0 ELSE 1 END) +
  (CASE WHEN "forkId" IS NULL THEN 0 ELSE 1 END) = 1
);
