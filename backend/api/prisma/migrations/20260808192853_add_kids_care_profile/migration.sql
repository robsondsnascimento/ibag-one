-- CreateTable
CREATE TABLE "KidsCareProfile" (
    "id" TEXT NOT NULL,
    "alergias" TEXT,
    "restricoesAlimentares" TEXT,
    "necessidadesFisicas" TEXT,
    "necessidadesCognitivas" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "KidsCareProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KidsCareProfile_childId_key" ON "KidsCareProfile"("childId");

-- AddForeignKey
ALTER TABLE "KidsCareProfile" ADD CONSTRAINT "KidsCareProfile_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
