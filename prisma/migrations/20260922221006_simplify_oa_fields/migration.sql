/*
  Warnings:

  - You are about to drop the column `date` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `preparation` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `process` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `questions` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `OaExam` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `OaExam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OaExam" DROP COLUMN "date",
DROP COLUMN "duration",
DROP COLUMN "notes",
DROP COLUMN "overview",
DROP COLUMN "platform",
DROP COLUMN "preparation",
DROP COLUMN "process",
DROP COLUMN "questions",
DROP COLUMN "role",
DROP COLUMN "source",
ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "example" TEXT,
ADD COLUMN     "functionDescription" TEXT,
ADD COLUMN     "questionDescription" TEXT NOT NULL DEFAULT '';
