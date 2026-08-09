-- CreateEnum
CREATE TYPE "WorshipRepertoireStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED', 'APPROVED', 'SENT_TO_WORSHIP_ORDER', 'COMPLETED');

-- CreateTable
CREATE TABLE "WorshipRepertoire" (
    "id" TEXT NOT NULL,
    "status" "WorshipRepertoireStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewComment" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "sentToWorshipOrderAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "submittedByPersonId" TEXT NOT NULL,
    "approvedByPersonId" TEXT,
    "orderItemId" TEXT,
    "deliveryDemandId" TEXT,

    CONSTRAINT "WorshipRepertoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorshipRepertoireSong" (
    "id" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "tom" TEXT,
    "artista" TEXT,
    "referencia" TEXT,
    "observacoes" TEXT,
    "repertoireId" TEXT NOT NULL,

    CONSTRAINT "WorshipRepertoireSong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorshipRepertoire_deliveryDemandId_key" ON "WorshipRepertoire"("deliveryDemandId");

-- CreateIndex
CREATE INDEX "WorshipRepertoire_organizationId_idx" ON "WorshipRepertoire"("organizationId");

-- CreateIndex
CREATE INDEX "WorshipRepertoire_serviceAreaId_idx" ON "WorshipRepertoire"("serviceAreaId");

-- CreateIndex
CREATE INDEX "WorshipRepertoire_status_idx" ON "WorshipRepertoire"("status");

-- CreateIndex
CREATE INDEX "WorshipRepertoire_orderItemId_idx" ON "WorshipRepertoire"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "WorshipRepertoire_eventId_serviceAreaId_key" ON "WorshipRepertoire"("eventId", "serviceAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "WorshipRepertoireSong_repertoireId_sequencia_key" ON "WorshipRepertoireSong"("repertoireId", "sequencia");

-- AddForeignKey
ALTER TABLE "WorshipRepertoire" ADD CONSTRAINT "WorshipRepertoire_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipRepertoire" ADD CONSTRAINT "WorshipRepertoire_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipRepertoire" ADD CONSTRAINT "WorshipRepertoire_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipRepertoire" ADD CONSTRAINT "WorshipRepertoire_submittedByPersonId_fkey" FOREIGN KEY ("submittedByPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipRepertoire" ADD CONSTRAINT "WorshipRepertoire_approvedByPersonId_fkey" FOREIGN KEY ("approvedByPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipRepertoire" ADD CONSTRAINT "WorshipRepertoire_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "WorshipOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipRepertoire" ADD CONSTRAINT "WorshipRepertoire_deliveryDemandId_fkey" FOREIGN KEY ("deliveryDemandId") REFERENCES "WorshipServiceDemand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipRepertoireSong" ADD CONSTRAINT "WorshipRepertoireSong_repertoireId_fkey" FOREIGN KEY ("repertoireId") REFERENCES "WorshipRepertoire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
