-- CreateEnum
CREATE TYPE "ServiceAreaApplicationStatus" AS ENUM ('INTERESTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "ServiceAreaEntryStage" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,

    CONSTRAINT "ServiceAreaEntryStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAreaApplication" (
    "id" TEXT NOT NULL,
    "status" "ServiceAreaApplicationStatus" NOT NULL DEFAULT 'INTERESTED',
    "observacao" TEXT,
    "decisaoMotivo" TEXT,
    "startedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "desiredTeamId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "decidedByUserId" TEXT,

    CONSTRAINT "ServiceAreaApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAreaApplicationStage" (
    "id" TEXT NOT NULL,
    "observacao" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT NOT NULL,
    "entryStageId" TEXT NOT NULL,
    "completedByUserId" TEXT NOT NULL,

    CONSTRAINT "ServiceAreaApplicationStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceAreaEntryStage_organizationId_idx" ON "ServiceAreaEntryStage"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceAreaEntryStage_serviceAreaId_idx" ON "ServiceAreaEntryStage"("serviceAreaId");

-- CreateIndex
CREATE INDEX "ServiceAreaEntryStage_ativo_idx" ON "ServiceAreaEntryStage"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAreaEntryStage_serviceAreaId_ordem_key" ON "ServiceAreaEntryStage"("serviceAreaId", "ordem");

-- CreateIndex
CREATE INDEX "ServiceAreaApplication_organizationId_idx" ON "ServiceAreaApplication"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceAreaApplication_serviceAreaId_idx" ON "ServiceAreaApplication"("serviceAreaId");

-- CreateIndex
CREATE INDEX "ServiceAreaApplication_personId_idx" ON "ServiceAreaApplication"("personId");

-- CreateIndex
CREATE INDEX "ServiceAreaApplication_desiredTeamId_idx" ON "ServiceAreaApplication"("desiredTeamId");

-- CreateIndex
CREATE INDEX "ServiceAreaApplication_status_idx" ON "ServiceAreaApplication"("status");

-- CreateIndex
CREATE INDEX "ServiceAreaApplicationStage_entryStageId_idx" ON "ServiceAreaApplicationStage"("entryStageId");

-- CreateIndex
CREATE INDEX "ServiceAreaApplicationStage_completedByUserId_idx" ON "ServiceAreaApplicationStage"("completedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAreaApplicationStage_applicationId_entryStageId_key" ON "ServiceAreaApplicationStage"("applicationId", "entryStageId");

-- AddForeignKey
ALTER TABLE "ServiceAreaEntryStage" ADD CONSTRAINT "ServiceAreaEntryStage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaEntryStage" ADD CONSTRAINT "ServiceAreaEntryStage_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplication" ADD CONSTRAINT "ServiceAreaApplication_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplication" ADD CONSTRAINT "ServiceAreaApplication_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplication" ADD CONSTRAINT "ServiceAreaApplication_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplication" ADD CONSTRAINT "ServiceAreaApplication_desiredTeamId_fkey" FOREIGN KEY ("desiredTeamId") REFERENCES "ServiceTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplication" ADD CONSTRAINT "ServiceAreaApplication_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplication" ADD CONSTRAINT "ServiceAreaApplication_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplicationStage" ADD CONSTRAINT "ServiceAreaApplicationStage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ServiceAreaApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplicationStage" ADD CONSTRAINT "ServiceAreaApplicationStage_entryStageId_fkey" FOREIGN KEY ("entryStageId") REFERENCES "ServiceAreaEntryStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAreaApplicationStage" ADD CONSTRAINT "ServiceAreaApplicationStage_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
