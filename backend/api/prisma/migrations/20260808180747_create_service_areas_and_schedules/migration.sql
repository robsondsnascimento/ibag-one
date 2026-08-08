-- CreateEnum
CREATE TYPE "ServiceAreaScope" AS ENUM ('GLOBAL', 'CAMPUS');

-- CreateEnum
CREATE TYPE "ServiceMembershipRole" AS ENUM ('GENERAL_LEADER', 'CAMPUS_LEADER', 'TEAM_LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ServiceScheduleStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'DECLINED', 'COMPLETED');

-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "scope" "ServiceAreaScope" NOT NULL DEFAULT 'GLOBAL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTeam" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,

    CONSTRAINT "ServiceTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceMembership" (
    "id" TEXT NOT NULL,
    "role" "ServiceMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "ServiceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSchedule" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "funcao" TEXT NOT NULL,
    "observacao" TEXT,
    "status" "ServiceScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "ServiceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceArea_organizationId_idx" ON "ServiceArea"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceArea_campusId_idx" ON "ServiceArea"("campusId");

-- CreateIndex
CREATE INDEX "ServiceArea_ativo_idx" ON "ServiceArea"("ativo");

-- CreateIndex
CREATE INDEX "ServiceTeam_organizationId_idx" ON "ServiceTeam"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceTeam_serviceAreaId_idx" ON "ServiceTeam"("serviceAreaId");

-- CreateIndex
CREATE INDEX "ServiceTeam_campusId_idx" ON "ServiceTeam"("campusId");

-- CreateIndex
CREATE INDEX "ServiceTeam_ativo_idx" ON "ServiceTeam"("ativo");

-- CreateIndex
CREATE INDEX "ServiceMembership_personId_idx" ON "ServiceMembership"("personId");

-- CreateIndex
CREATE INDEX "ServiceMembership_serviceAreaId_idx" ON "ServiceMembership"("serviceAreaId");

-- CreateIndex
CREATE INDEX "ServiceMembership_teamId_idx" ON "ServiceMembership"("teamId");

-- CreateIndex
CREATE INDEX "ServiceMembership_ativo_idx" ON "ServiceMembership"("ativo");

-- CreateIndex
CREATE INDEX "ServiceSchedule_organizationId_idx" ON "ServiceSchedule"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceSchedule_teamId_idx" ON "ServiceSchedule"("teamId");

-- CreateIndex
CREATE INDEX "ServiceSchedule_personId_idx" ON "ServiceSchedule"("personId");

-- CreateIndex
CREATE INDEX "ServiceSchedule_data_idx" ON "ServiceSchedule"("data");

-- AddForeignKey
ALTER TABLE "ServiceArea" ADD CONSTRAINT "ServiceArea_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceArea" ADD CONSTRAINT "ServiceArea_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTeam" ADD CONSTRAINT "ServiceTeam_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTeam" ADD CONSTRAINT "ServiceTeam_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTeam" ADD CONSTRAINT "ServiceTeam_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceMembership" ADD CONSTRAINT "ServiceMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceMembership" ADD CONSTRAINT "ServiceMembership_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceMembership" ADD CONSTRAINT "ServiceMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ServiceTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ServiceTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
