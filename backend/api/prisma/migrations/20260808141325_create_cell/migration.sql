-- CreateTable
CREATE TABLE "Cell" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CellMembership" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,

    CONSTRAINT "CellMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CellLeadership" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,

    CONSTRAINT "CellLeadership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cell_organizationId_idx" ON "Cell"("organizationId");

-- CreateIndex
CREATE INDEX "Cell_campusId_idx" ON "Cell"("campusId");

-- CreateIndex
CREATE INDEX "CellMembership_personId_idx" ON "CellMembership"("personId");

-- CreateIndex
CREATE INDEX "CellMembership_cellId_idx" ON "CellMembership"("cellId");

-- CreateIndex
CREATE INDEX "CellMembership_ativo_idx" ON "CellMembership"("ativo");

-- CreateIndex
CREATE INDEX "CellLeadership_personId_idx" ON "CellLeadership"("personId");

-- CreateIndex
CREATE INDEX "CellLeadership_cellId_idx" ON "CellLeadership"("cellId");

-- CreateIndex
CREATE INDEX "CellLeadership_ativo_idx" ON "CellLeadership"("ativo");

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellMembership" ADD CONSTRAINT "CellMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellMembership" ADD CONSTRAINT "CellMembership_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellLeadership" ADD CONSTRAINT "CellLeadership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellLeadership" ADD CONSTRAINT "CellLeadership_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
