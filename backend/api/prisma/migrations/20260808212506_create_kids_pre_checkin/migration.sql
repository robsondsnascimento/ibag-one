-- CreateEnum
CREATE TYPE "KidsPreCheckInStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "KidsPreCheckIn" (
    "id" TEXT NOT NULL,
    "status" "KidsPreCheckInStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "childId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "responsiblePersonId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "KidsPreCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KidsPreCheckIn_childId_idx" ON "KidsPreCheckIn"("childId");

-- CreateIndex
CREATE INDEX "KidsPreCheckIn_eventId_idx" ON "KidsPreCheckIn"("eventId");

-- CreateIndex
CREATE INDEX "KidsPreCheckIn_status_idx" ON "KidsPreCheckIn"("status");

-- AddForeignKey
ALTER TABLE "KidsPreCheckIn" ADD CONSTRAINT "KidsPreCheckIn_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsPreCheckIn" ADD CONSTRAINT "KidsPreCheckIn_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "KidsEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsPreCheckIn" ADD CONSTRAINT "KidsPreCheckIn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
