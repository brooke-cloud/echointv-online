-- Phase 1 is additive only. Existing import drafts and Problem rows are preserved.
ALTER TABLE "InterviewImportDraft"
ADD COLUMN IF NOT EXISTS "notionTitle" TEXT,
ADD COLUMN IF NOT EXISTS "parsedPayload" JSONB;

ALTER TABLE "InterviewImportDraft"
ALTER COLUMN "status" SET DEFAULT 'READY';
