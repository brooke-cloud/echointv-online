/*
  Warnings:

  - Made the column `slug` on table `Problem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "slug" SET NOT NULL;
