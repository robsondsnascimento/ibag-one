-- AlterTable
ALTER TABLE "Cell" ADD COLUMN     "networkId" TEXT;

-- CreateTable
CREATE TABLE "CellNetwork" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,

    CONSTRAINT "CellNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CellNetwork_organizationId_idx" ON "CellNetwork"("organizationId");

-- CreateIndex
CREATE INDEX "CellNetwork_campusId_idx" ON "CellNetwork"("campusId");

-- CreateIndex
CREATE INDEX "CellNetwork_ativo_idx" ON "CellNetwork"("ativo");

-- CreateIndex
CREATE INDEX "Cell_networkId_idx" ON "Cell"("networkId");

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "CellNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellNetwork" ADD CONSTRAINT "CellNetwork_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellNetwork" ADD CONSTRAINT "CellNetwork_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
