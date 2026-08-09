-- CreateEnum
CREATE TYPE "ServiceScheduleHistoryAction" AS ENUM ('CREATED', 'STATUS_CHANGED', 'SUBSTITUTED');

-- CreateTable
CREATE TABLE "ServiceScheduleHistory" (
    "id" TEXT NOT NULL,
    "action" "ServiceScheduleHistoryAction" NOT NULL,
    "previousStatus" "ServiceScheduleStatus",
    "newStatus" "ServiceScheduleStatus",
    "previousPersonId" TEXT,
    "replacementPersonId" TEXT,
    "previousPersonName" TEXT,
    "replacementPersonName" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleId" TEXT NOT NULL,
    "changedByUserId" TEXT NOT NULL,

    CONSTRAINT "ServiceScheduleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceScheduleHistory_scheduleId_idx" ON "ServiceScheduleHistory"("scheduleId");

-- CreateIndex
CREATE INDEX "ServiceScheduleHistory_changedByUserId_idx" ON "ServiceScheduleHistory"("changedByUserId");

-- AddForeignKey
ALTER TABLE "ServiceScheduleHistory" ADD CONSTRAINT "ServiceScheduleHistory_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ServiceSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceScheduleHistory" ADD CONSTRAINT "ServiceScheduleHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
