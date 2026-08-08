-- CreateEnum
CREATE TYPE "WorshipOrderStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "WorshipMaterialType" AS ENUM ('CARD', 'VIDEO', 'PRESENTATION', 'MUSIC', 'PRO_PRESENTER', 'OTHER');

-- CreateEnum
CREATE TYPE "WorshipDemandStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "WorshipOrder" (
    "id" TEXT NOT NULL,
    "status" "WorshipOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "WorshipOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorshipOrderItem" (
    "id" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "horario" TEXT,
    "observacoes" TEXT,
    "orderId" TEXT NOT NULL,
    "responsiblePersonId" TEXT,
    "serviceAreaId" TEXT,

    CONSTRAINT "WorshipOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorshipOrderMaterial" (
    "id" TEXT NOT NULL,
    "type" "WorshipMaterialType" NOT NULL,
    "titulo" TEXT NOT NULL,
    "referencia" TEXT,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "WorshipOrderMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorshipServiceDemand" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "status" "WorshipDemandStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "itemId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "responsiblePersonId" TEXT,

    CONSTRAINT "WorshipServiceDemand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorshipOrder_eventId_key" ON "WorshipOrder"("eventId");

-- CreateIndex
CREATE INDEX "WorshipOrderItem_serviceAreaId_idx" ON "WorshipOrderItem"("serviceAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "WorshipOrderItem_orderId_sequencia_key" ON "WorshipOrderItem"("orderId", "sequencia");

-- CreateIndex
CREATE INDEX "WorshipOrderMaterial_itemId_idx" ON "WorshipOrderMaterial"("itemId");

-- CreateIndex
CREATE INDEX "WorshipServiceDemand_itemId_idx" ON "WorshipServiceDemand"("itemId");

-- CreateIndex
CREATE INDEX "WorshipServiceDemand_serviceAreaId_idx" ON "WorshipServiceDemand"("serviceAreaId");

-- CreateIndex
CREATE INDEX "WorshipServiceDemand_status_idx" ON "WorshipServiceDemand"("status");

-- AddForeignKey
ALTER TABLE "WorshipOrder" ADD CONSTRAINT "WorshipOrder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrder" ADD CONSTRAINT "WorshipOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderItem" ADD CONSTRAINT "WorshipOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WorshipOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderItem" ADD CONSTRAINT "WorshipOrderItem_responsiblePersonId_fkey" FOREIGN KEY ("responsiblePersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderItem" ADD CONSTRAINT "WorshipOrderItem_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderMaterial" ADD CONSTRAINT "WorshipOrderMaterial_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WorshipOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipServiceDemand" ADD CONSTRAINT "WorshipServiceDemand_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WorshipOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipServiceDemand" ADD CONSTRAINT "WorshipServiceDemand_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipServiceDemand" ADD CONSTRAINT "WorshipServiceDemand_responsiblePersonId_fkey" FOREIGN KEY ("responsiblePersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
