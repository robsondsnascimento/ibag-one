-- AlterTable
ALTER TABLE "ServiceMembership" ADD COLUMN     "campusId" TEXT;

-- CreateIndex
CREATE INDEX "ServiceMembership_campusId_idx" ON "ServiceMembership"("campusId");

-- AddForeignKey
ALTER TABLE "ServiceMembership" ADD CONSTRAINT "ServiceMembership_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
