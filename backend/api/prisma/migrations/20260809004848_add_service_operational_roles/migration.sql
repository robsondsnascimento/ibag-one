-- CreateEnum
CREATE TYPE "ServiceOperationalRole" AS ENUM ('WORSHIP_MINISTER');

-- CreateTable
CREATE TABLE "ServiceOperationalRoleAssignment" (
    "id" TEXT NOT NULL,
    "role" "ServiceOperationalRole" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "ServiceOperationalRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceOperationalRoleAssignment_organizationId_idx" ON "ServiceOperationalRoleAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceOperationalRoleAssignment_serviceAreaId_idx" ON "ServiceOperationalRoleAssignment"("serviceAreaId");

-- CreateIndex
CREATE INDEX "ServiceOperationalRoleAssignment_teamId_idx" ON "ServiceOperationalRoleAssignment"("teamId");

-- CreateIndex
CREATE INDEX "ServiceOperationalRoleAssignment_personId_idx" ON "ServiceOperationalRoleAssignment"("personId");

-- CreateIndex
CREATE INDEX "ServiceOperationalRoleAssignment_role_idx" ON "ServiceOperationalRoleAssignment"("role");

-- CreateIndex
CREATE INDEX "ServiceOperationalRoleAssignment_ativo_idx" ON "ServiceOperationalRoleAssignment"("ativo");

-- AddForeignKey
ALTER TABLE "ServiceOperationalRoleAssignment" ADD CONSTRAINT "ServiceOperationalRoleAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOperationalRoleAssignment" ADD CONSTRAINT "ServiceOperationalRoleAssignment_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOperationalRoleAssignment" ADD CONSTRAINT "ServiceOperationalRoleAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ServiceTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOperationalRoleAssignment" ADD CONSTRAINT "ServiceOperationalRoleAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
