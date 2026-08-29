CREATE TABLE "ServiceScheduleNote" (
  "id" TEXT NOT NULL,
  "data" TIMESTAMP(3) NOT NULL,
  "observacao" TEXT NOT NULL,
  "updatedByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "organizationId" TEXT NOT NULL,
  "serviceAreaId" TEXT NOT NULL,
  "campusId" TEXT NOT NULL,
  "eventId" TEXT,

  CONSTRAINT "ServiceScheduleNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceScheduleNote_serviceAreaId_campusId_data_key"
  ON "ServiceScheduleNote"("serviceAreaId", "campusId", "data");

CREATE INDEX "ServiceScheduleNote_organizationId_idx" ON "ServiceScheduleNote"("organizationId");
CREATE INDEX "ServiceScheduleNote_serviceAreaId_data_idx" ON "ServiceScheduleNote"("serviceAreaId", "data");
CREATE INDEX "ServiceScheduleNote_campusId_data_idx" ON "ServiceScheduleNote"("campusId", "data");
CREATE INDEX "ServiceScheduleNote_eventId_idx" ON "ServiceScheduleNote"("eventId");

ALTER TABLE "ServiceScheduleNote" ADD CONSTRAINT "ServiceScheduleNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleNote" ADD CONSTRAINT "ServiceScheduleNote_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleNote" ADD CONSTRAINT "ServiceScheduleNote_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceScheduleNote" ADD CONSTRAINT "ServiceScheduleNote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
