-- CreateEnum
CREATE TYPE "PersonJourneyStage" AS ENUM ('CELL_PARTICIPANT', 'DECISION', 'CONSOLIDATION', 'FORMAL_MEMBER', 'DISCIPLESHIP', 'LEADERSHIP');

-- CreateTable
CREATE TABLE "PersonJourneyEvent" (
    "id" TEXT NOT NULL,
    "stage" "PersonJourneyStage" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "personId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "PersonJourneyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonJourneyEvent_personId_idx" ON "PersonJourneyEvent"("personId");

-- CreateIndex
CREATE INDEX "PersonJourneyEvent_organizationId_idx" ON "PersonJourneyEvent"("organizationId");

-- CreateIndex
CREATE INDEX "PersonJourneyEvent_stage_idx" ON "PersonJourneyEvent"("stage");

-- AddForeignKey
ALTER TABLE "PersonJourneyEvent" ADD CONSTRAINT "PersonJourneyEvent_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonJourneyEvent" ADD CONSTRAINT "PersonJourneyEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonJourneyEvent" ADD CONSTRAINT "PersonJourneyEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
