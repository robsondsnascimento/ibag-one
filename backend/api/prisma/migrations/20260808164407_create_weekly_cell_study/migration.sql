-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'SECRETARY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MEMBER';

-- CreateTable
CREATE TABLE "CellStudy" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "attachmentPath" TEXT NOT NULL,
    "attachmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "CellStudy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CellStudy_organizationId_weekStart_key" ON "CellStudy"("organizationId", "weekStart");

-- AddForeignKey
ALTER TABLE "CellStudy" ADD CONSTRAINT "CellStudy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
