/*
  Warnings:

  - You are about to drop the column `worshipOrderItemId` on the `ServiceSchedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceSchedule" DROP CONSTRAINT "ServiceSchedule_worshipOrderItemId_fkey";

-- DropIndex
DROP INDEX "ServiceSchedule_worshipOrderItemId_idx";

-- AlterTable
ALTER TABLE "ServiceSchedule" DROP COLUMN "worshipOrderItemId";
