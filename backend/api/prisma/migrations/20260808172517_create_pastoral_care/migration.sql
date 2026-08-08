-- CreateEnum
CREATE TYPE "PastoralCareStatus" AS ENUM ('OPEN', 'COMPLETED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PASTOR';

-- CreateTable
CREATE TABLE "PastoralCare" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "proximoPasso" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "PastoralCareStatus" NOT NULL DEFAULT 'OPEN',
    "concluidoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subjectPersonId" TEXT NOT NULL,
    "responsiblePersonId" TEXT NOT NULL,

    CONSTRAINT "PastoralCare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PastoralCare_organizationId_idx" ON "PastoralCare"("organizationId");

-- CreateIndex
CREATE INDEX "PastoralCare_subjectPersonId_idx" ON "PastoralCare"("subjectPersonId");

-- CreateIndex
CREATE INDEX "PastoralCare_responsiblePersonId_idx" ON "PastoralCare"("responsiblePersonId");

-- CreateIndex
CREATE INDEX "PastoralCare_status_idx" ON "PastoralCare"("status");

-- AddForeignKey
ALTER TABLE "PastoralCare" ADD CONSTRAINT "PastoralCare_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastoralCare" ADD CONSTRAINT "PastoralCare_subjectPersonId_fkey" FOREIGN KEY ("subjectPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastoralCare" ADD CONSTRAINT "PastoralCare_responsiblePersonId_fkey" FOREIGN KEY ("responsiblePersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
