-- CreateTable
CREATE TABLE "CellMultiplication" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceCellId" TEXT NOT NULL,
    "newCellId" TEXT NOT NULL,

    CONSTRAINT "CellMultiplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CellMultiplication_newCellId_key" ON "CellMultiplication"("newCellId");

-- CreateIndex
CREATE INDEX "CellMultiplication_sourceCellId_idx" ON "CellMultiplication"("sourceCellId");

-- AddForeignKey
ALTER TABLE "CellMultiplication" ADD CONSTRAINT "CellMultiplication_sourceCellId_fkey" FOREIGN KEY ("sourceCellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellMultiplication" ADD CONSTRAINT "CellMultiplication_newCellId_fkey" FOREIGN KEY ("newCellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
