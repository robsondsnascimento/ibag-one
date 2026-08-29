CREATE TABLE "ServiceScheduleUnavailability" (
  "id" TEXT NOT NULL,
  "data" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "organizationId" TEXT NOT NULL,
  "serviceAreaId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,

  CONSTRAINT "ServiceScheduleUnavailability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceScheduleUnavailability_serviceAreaId_personId_data_key"
  ON "ServiceScheduleUnavailability"("serviceAreaId", "personId", "data");

CREATE INDEX "ServiceScheduleUnavailability_organizationId_idx"
  ON "ServiceScheduleUnavailability"("organizationId");

CREATE INDEX "ServiceScheduleUnavailability_serviceAreaId_data_idx"
  ON "ServiceScheduleUnavailability"("serviceAreaId", "data");

CREATE INDEX "ServiceScheduleUnavailability_personId_data_idx"
  ON "ServiceScheduleUnavailability"("personId", "data");

ALTER TABLE "ServiceScheduleUnavailability"
  ADD CONSTRAINT "ServiceScheduleUnavailability_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ServiceScheduleUnavailability"
  ADD CONSTRAINT "ServiceScheduleUnavailability_serviceAreaId_fkey"
  FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ServiceScheduleUnavailability"
  ADD CONSTRAINT "ServiceScheduleUnavailability_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
