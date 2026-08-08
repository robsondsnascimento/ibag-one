-- CreateEnum
CREATE TYPE "KidsResourceRequestStatus" AS ENUM ('REQUESTED', 'READY', 'DELIVERED', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "KidsVisualResource" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "quantidadeDisponivel" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "KidsVisualResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsResourceRequest" (
    "id" TEXT NOT NULL,
    "status" "KidsResourceRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "requestedByPersonId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "KidsResourceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsResourceRequestItem" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "requestId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "KidsResourceRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KidsVisualResource_organizationId_idx" ON "KidsVisualResource"("organizationId");

-- CreateIndex
CREATE INDEX "KidsResourceRequest_eventId_idx" ON "KidsResourceRequest"("eventId");

-- CreateIndex
CREATE INDEX "KidsResourceRequest_organizationId_idx" ON "KidsResourceRequest"("organizationId");

-- CreateIndex
CREATE INDEX "KidsResourceRequest_status_idx" ON "KidsResourceRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "KidsResourceRequestItem_requestId_resourceId_key" ON "KidsResourceRequestItem"("requestId", "resourceId");

-- AddForeignKey
ALTER TABLE "KidsVisualResource" ADD CONSTRAINT "KidsVisualResource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsResourceRequest" ADD CONSTRAINT "KidsResourceRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsResourceRequest" ADD CONSTRAINT "KidsResourceRequest_requestedByPersonId_fkey" FOREIGN KEY ("requestedByPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsResourceRequest" ADD CONSTRAINT "KidsResourceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsResourceRequestItem" ADD CONSTRAINT "KidsResourceRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "KidsResourceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsResourceRequestItem" ADD CONSTRAINT "KidsResourceRequestItem_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "KidsVisualResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
