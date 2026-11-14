-- Expand-only migration: old application versions safely ignore these columns.
ALTER TABLE "Problem" ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;

-- Preserve the access users had before explicit flags were introduced.
UPDATE "Problem"
SET "isFree" = true
WHERE "id" IN (
  SELECT "id" FROM "Problem" ORDER BY "id" ASC LIMIT 6
);

UPDATE "Post"
SET "isFree" = true
WHERE "id" IN (
  SELECT "id" FROM "Post" ORDER BY "id" ASC LIMIT 5
);

CREATE INDEX IF NOT EXISTS "Problem_isFree_idx" ON "Problem"("isFree");
CREATE INDEX IF NOT EXISTS "Post_isFree_idx" ON "Post"("isFree");
