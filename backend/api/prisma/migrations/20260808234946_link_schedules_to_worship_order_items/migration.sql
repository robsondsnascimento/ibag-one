-- AlterTable
ALTER TABLE "ServiceSchedule" ADD COLUMN     "worshipOrderItemId" TEXT;

-- CreateIndex
CREATE INDEX "ServiceSchedule_worshipOrderItemId_idx" ON "ServiceSchedule"("worshipOrderItemId");

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_worshipOrderItemId_fkey" FOREIGN KEY ("worshipOrderItemId") REFERENCES "WorshipOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
