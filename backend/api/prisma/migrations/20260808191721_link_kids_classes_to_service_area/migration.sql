/*
  Warnings:

  - Added the required column `serviceAreaId` to the `KidsClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KidsClass" ADD COLUMN     "serviceAreaId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "KidsClass_serviceAreaId_idx" ON "KidsClass"("serviceAreaId");

-- AddForeignKey
ALTER TABLE "KidsClass" ADD CONSTRAINT "KidsClass_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
