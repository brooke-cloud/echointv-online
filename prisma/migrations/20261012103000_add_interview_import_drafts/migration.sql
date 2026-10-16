CREATE TABLE "InterviewImportDraft" (
    "id" SERIAL NOT NULL,
    "notionPageId" TEXT NOT NULL,
    "notionName" TEXT NOT NULL,
    "notionCompany" TEXT,
    "notionStatus" TEXT,
    "hasCode" BOOLEAN NOT NULL DEFAULT false,
    "notionPublishedPropertyType" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "problemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewImportDraft_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InterviewImportDraft_notionPageId_key" ON "InterviewImportDraft"("notionPageId");
CREATE UNIQUE INDEX "InterviewImportDraft_problemId_key" ON "InterviewImportDraft"("problemId");
CREATE INDEX "InterviewImportDraft_status_idx" ON "InterviewImportDraft"("status");
CREATE INDEX "InterviewImportDraft_createdAt_idx" ON "InterviewImportDraft"("createdAt");
