/*
  Warnings:

  - You are about to drop the column `isPro` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paddleSubscriptionId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_paddleSubscriptionId_key";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "company" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPro",
DROP COLUMN "paddleSubscriptionId",
ADD COLUMN     "proStartedAt" TIMESTAMP(3);
