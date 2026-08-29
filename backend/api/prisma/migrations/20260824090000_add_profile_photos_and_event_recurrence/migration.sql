CREATE TYPE "EventRecurrence" AS ENUM ('NONE', 'WEEKLY', 'MONTHLY');

ALTER TABLE "Person"
  ADD COLUMN "fotoPerfilPath" TEXT,
  ADD COLUMN "fotoPerfilMimeType" TEXT,
  ADD COLUMN "fotoPerfilAtualizadaEm" TIMESTAMP(3);

ALTER TABLE "Event"
  ADD COLUMN "recurrence" "EventRecurrence" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "recurrenceSeriesId" TEXT,
  ADD COLUMN "recurrenceUntil" TIMESTAMP(3);

CREATE INDEX "Event_organizationId_recurrenceSeriesId_idx"
  ON "Event"("organizationId", "recurrenceSeriesId");
