-- CreateTable
CREATE TABLE "CellMeeting" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tema" TEXT,
    "observacoes" TEXT,
    "visitantes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cellId" TEXT NOT NULL,

    CONSTRAINT "CellMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CellMeeting_cellId_idx" ON "CellMeeting"("cellId");

-- CreateIndex
CREATE INDEX "CellMeeting_data_idx" ON "CellMeeting"("data");

-- AddForeignKey
ALTER TABLE "CellMeeting" ADD CONSTRAINT "CellMeeting_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
