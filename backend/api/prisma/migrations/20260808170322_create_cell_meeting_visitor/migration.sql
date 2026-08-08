-- CreateTable
CREATE TABLE "CellMeetingVisitor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meetingId" TEXT NOT NULL,

    CONSTRAINT "CellMeetingVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CellMeetingVisitor_meetingId_idx" ON "CellMeetingVisitor"("meetingId");

-- AddForeignKey
ALTER TABLE "CellMeetingVisitor" ADD CONSTRAINT "CellMeetingVisitor_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "CellMeeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
