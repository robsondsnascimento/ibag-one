-- CreateTable
CREATE TABLE "CellCampusCoordination" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,

    CONSTRAINT "CellCampusCoordination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CellCampusCoordination_personId_idx" ON "CellCampusCoordination"("personId");

-- CreateIndex
CREATE INDEX "CellCampusCoordination_campusId_idx" ON "CellCampusCoordination"("campusId");

-- CreateIndex
CREATE INDEX "CellCampusCoordination_ativo_idx" ON "CellCampusCoordination"("ativo");

-- AddForeignKey
ALTER TABLE "CellCampusCoordination" ADD CONSTRAINT "CellCampusCoordination_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellCampusCoordination" ADD CONSTRAINT "CellCampusCoordination_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
