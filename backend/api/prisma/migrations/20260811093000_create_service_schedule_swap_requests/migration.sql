-- CreateEnum
CREATE TYPE "ServiceScheduleSwapRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ServiceMembership" ADD COLUMN "funcoes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ServiceScheduleSwapRequest" (
    "id" TEXT NOT NULL,
    "status" "ServiceScheduleSwapRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "decisionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "requesterPersonId" TEXT NOT NULL,
    "replacementPersonId" TEXT NOT NULL,
    "decidedByUserId" TEXT,

    CONSTRAINT "ServiceScheduleSwapRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceScheduleSwapRequest_organizationId_idx" ON "ServiceScheduleSwapRequest"("organizationId");
CREATE INDEX "ServiceScheduleSwapRequest_teamId_idx" ON "ServiceScheduleSwapRequest"("teamId");
CREATE INDEX "ServiceScheduleSwapRequest_scheduleId_idx" ON "ServiceScheduleSwapRequest"("scheduleId");
CREATE INDEX "ServiceScheduleSwapRequest_requesterPersonId_idx" ON "ServiceScheduleSwapRequest"("requesterPersonId");
CREATE INDEX "ServiceScheduleSwapRequest_replacementPersonId_idx" ON "ServiceScheduleSwapRequest"("replacementPersonId");
CREATE INDEX "ServiceScheduleSwapRequest_status_idx" ON "ServiceScheduleSwapRequest"("status");

-- AddForeignKey
ALTER TABLE "ServiceScheduleSwapRequest" ADD CONSTRAINT "ServiceScheduleSwapRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleSwapRequest" ADD CONSTRAINT "ServiceScheduleSwapRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ServiceTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleSwapRequest" ADD CONSTRAINT "ServiceScheduleSwapRequest_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ServiceSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleSwapRequest" ADD CONSTRAINT "ServiceScheduleSwapRequest_requesterPersonId_fkey" FOREIGN KEY ("requesterPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleSwapRequest" ADD CONSTRAINT "ServiceScheduleSwapRequest_replacementPersonId_fkey" FOREIGN KEY ("replacementPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleSwapRequest" ADD CONSTRAINT "ServiceScheduleSwapRequest_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
