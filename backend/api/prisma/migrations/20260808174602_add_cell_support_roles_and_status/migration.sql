-- CreateEnum
CREATE TYPE "CellStatus" AS ENUM ('PLANNING', 'ACTIVE', 'MULTIPLIED', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CellSupportRoleType" AS ENUM ('LEADER_IN_TRAINING', 'HOST');

-- AlterTable
ALTER TABLE "Cell" ADD COLUMN     "status" "CellStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "CellSupportRole" (
    "id" TEXT NOT NULL,
    "role" "CellSupportRoleType" NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,

    CONSTRAINT "CellSupportRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CellSupportRole_personId_idx" ON "CellSupportRole"("personId");

-- CreateIndex
CREATE INDEX "CellSupportRole_cellId_idx" ON "CellSupportRole"("cellId");

-- CreateIndex
CREATE INDEX "CellSupportRole_role_idx" ON "CellSupportRole"("role");

-- CreateIndex
CREATE INDEX "CellSupportRole_ativo_idx" ON "CellSupportRole"("ativo");

-- AddForeignKey
ALTER TABLE "CellSupportRole" ADD CONSTRAINT "CellSupportRole_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellSupportRole" ADD CONSTRAINT "CellSupportRole_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
