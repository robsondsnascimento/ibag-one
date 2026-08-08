-- CreateTable
CREATE TABLE "CellMeetingAttendance" (
    "id" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT true,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meetingId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "CellMeetingAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CellMeetingAttendance_personId_idx" ON "CellMeetingAttendance"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "CellMeetingAttendance_meetingId_personId_key" ON "CellMeetingAttendance"("meetingId", "personId");

-- AddForeignKey
ALTER TABLE "CellMeetingAttendance" ADD CONSTRAINT "CellMeetingAttendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "CellMeeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellMeetingAttendance" ADD CONSTRAINT "CellMeetingAttendance_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
