-- AlterTable
ALTER TABLE "WorshipOrder" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "WorshipOrderTemplate" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "WorshipOrderTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorshipOrderTemplateItem" (
    "id" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "horario" TEXT,
    "observacoes" TEXT,
    "templateId" TEXT NOT NULL,
    "serviceAreaId" TEXT,

    CONSTRAINT "WorshipOrderTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorshipOrderTemplate_organizationId_idx" ON "WorshipOrderTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "WorshipOrderTemplate_organizationId_ativo_idx" ON "WorshipOrderTemplate"("organizationId", "ativo");

-- CreateIndex
CREATE INDEX "WorshipOrderTemplate_organizationId_padrao_idx" ON "WorshipOrderTemplate"("organizationId", "padrao");

-- CreateIndex
CREATE INDEX "WorshipOrderTemplateItem_serviceAreaId_idx" ON "WorshipOrderTemplateItem"("serviceAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "WorshipOrderTemplateItem_templateId_sequencia_key" ON "WorshipOrderTemplateItem"("templateId", "sequencia");

-- CreateIndex
CREATE INDEX "WorshipOrder_templateId_idx" ON "WorshipOrder"("templateId");

-- AddForeignKey
ALTER TABLE "WorshipOrder" ADD CONSTRAINT "WorshipOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorshipOrderTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderTemplate" ADD CONSTRAINT "WorshipOrderTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderTemplate" ADD CONSTRAINT "WorshipOrderTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderTemplateItem" ADD CONSTRAINT "WorshipOrderTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorshipOrderTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipOrderTemplateItem" ADD CONSTRAINT "WorshipOrderTemplateItem_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
