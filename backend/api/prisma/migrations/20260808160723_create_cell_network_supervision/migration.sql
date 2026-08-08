-- CreateTable
CREATE TABLE "CellNetworkSupervision" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,

    CONSTRAINT "CellNetworkSupervision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CellNetworkSupervision_personId_idx" ON "CellNetworkSupervision"("personId");

-- CreateIndex
CREATE INDEX "CellNetworkSupervision_networkId_idx" ON "CellNetworkSupervision"("networkId");

-- CreateIndex
CREATE INDEX "CellNetworkSupervision_ativo_idx" ON "CellNetworkSupervision"("ativo");

-- AddForeignKey
ALTER TABLE "CellNetworkSupervision" ADD CONSTRAINT "CellNetworkSupervision_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellNetworkSupervision" ADD CONSTRAINT "CellNetworkSupervision_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "CellNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
