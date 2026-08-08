ALTER TABLE "CellMeetingVisitor" ADD COLUMN "personId" TEXT;

CREATE UNIQUE INDEX "CellMeetingVisitor_personId_key"
ON "CellMeetingVisitor"("personId");

ALTER TABLE "CellMeetingVisitor"
ADD CONSTRAINT "CellMeetingVisitor_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "Person"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
