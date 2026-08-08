/*
  Warnings:

  - Added the required column `teamId` to the `KidsClass` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KidsOperationalRole" AS ENUM ('CHECK_IN', 'SECURITY', 'WORSHIP_LEADER');

-- AlterTable
ALTER TABLE "KidsClass" ADD COLUMN     "teamId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "KidsOperationalRoleAssignment" (
    "id" TEXT NOT NULL,
    "role" "KidsOperationalRole" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "personId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "KidsOperationalRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KidsOperationalRoleAssignment_personId_idx" ON "KidsOperationalRoleAssignment"("personId");

-- CreateIndex
CREATE INDEX "KidsOperationalRoleAssignment_campusId_idx" ON "KidsOperationalRoleAssignment"("campusId");

-- CreateIndex
CREATE INDEX "KidsOperationalRoleAssignment_organizationId_idx" ON "KidsOperationalRoleAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "KidsOperationalRoleAssignment_role_idx" ON "KidsOperationalRoleAssignment"("role");

-- CreateIndex
CREATE INDEX "KidsOperationalRoleAssignment_ativo_idx" ON "KidsOperationalRoleAssignment"("ativo");

-- AddForeignKey
ALTER TABLE "KidsClass" ADD CONSTRAINT "KidsClass_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ServiceTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsOperationalRoleAssignment" ADD CONSTRAINT "KidsOperationalRoleAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsOperationalRoleAssignment" ADD CONSTRAINT "KidsOperationalRoleAssignment_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsOperationalRoleAssignment" ADD CONSTRAINT "KidsOperationalRoleAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
