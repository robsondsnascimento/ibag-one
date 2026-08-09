-- CreateEnum
CREATE TYPE "GoogleCalendarSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "cellId" TEXT;

-- CreateTable
CREATE TABLE "GoogleCalendarEventSync" (
    "id" TEXT NOT NULL,
    "googleEventId" TEXT,
    "status" "GoogleCalendarSyncStatus" NOT NULL DEFAULT 'PENDING',
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "GoogleCalendarEventSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarEventSync_googleEventId_key" ON "GoogleCalendarEventSync"("googleEventId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarEventSync_eventId_key" ON "GoogleCalendarEventSync"("eventId");

-- CreateIndex
CREATE INDEX "GoogleCalendarEventSync_status_idx" ON "GoogleCalendarEventSync"("status");

-- CreateIndex
CREATE INDEX "Event_cellId_idx" ON "Event"("cellId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarEventSync" ADD CONSTRAINT "GoogleCalendarEventSync_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
