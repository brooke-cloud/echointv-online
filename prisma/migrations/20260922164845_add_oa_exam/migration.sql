-- CreateTable
CREATE TABLE "OaExam" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT,
    "platform" TEXT,
    "duration" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "date" TEXT,
    "overview" TEXT NOT NULL,
    "process" TEXT,
    "questions" TEXT NOT NULL,
    "preparation" TEXT,
    "notes" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OaExam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OaExam_slug_key" ON "OaExam"("slug");

-- CreateIndex
CREATE INDEX "OaExam_company_idx" ON "OaExam"("company");

-- CreateIndex
CREATE INDEX "OaExam_difficulty_idx" ON "OaExam"("difficulty");

-- CreateIndex
CREATE INDEX "OaExam_status_idx" ON "OaExam"("status");

-- CreateIndex
CREATE INDEX "OaExam_createdAt_idx" ON "OaExam"("createdAt");
