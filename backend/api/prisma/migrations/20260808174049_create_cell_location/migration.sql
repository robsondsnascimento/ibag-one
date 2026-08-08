-- CreateTable
CREATE TABLE "CellLocation" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cellId" TEXT NOT NULL,

    CONSTRAINT "CellLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CellLocation_cellId_key" ON "CellLocation"("cellId");

-- AddForeignKey
ALTER TABLE "CellLocation" ADD CONSTRAINT "CellLocation_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
