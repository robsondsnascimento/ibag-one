-- CreateEnum
CREATE TYPE "KidsCheckInStatus" AS ENUM ('CHECKED_IN', 'CHECKED_OUT');

-- CreateTable
CREATE TABLE "KidsClass" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "idadeMinima" INTEGER,
    "idadeMaxima" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "spaceId" TEXT,

    CONSTRAINT "KidsClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsEnrollment" (
    "id" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "classId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "KidsEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsAuthorizedPickup" (
    "id" TEXT NOT NULL,
    "parentesco" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,
    "responsiblePersonId" TEXT NOT NULL,

    CONSTRAINT "KidsAuthorizedPickup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsCheckIn" (
    "id" TEXT NOT NULL,
    "status" "KidsCheckInStatus" NOT NULL DEFAULT 'CHECKED_IN',
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutAt" TIMESTAMP(3),
    "enrollmentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "checkedInByPersonId" TEXT NOT NULL,
    "checkedOutByPersonId" TEXT,

    CONSTRAINT "KidsCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KidsClass_organizationId_idx" ON "KidsClass"("organizationId");

-- CreateIndex
CREATE INDEX "KidsClass_campusId_idx" ON "KidsClass"("campusId");

-- CreateIndex
CREATE INDEX "KidsClass_spaceId_idx" ON "KidsClass"("spaceId");

-- CreateIndex
CREATE INDEX "KidsEnrollment_classId_idx" ON "KidsEnrollment"("classId");

-- CreateIndex
CREATE INDEX "KidsEnrollment_childId_idx" ON "KidsEnrollment"("childId");

-- CreateIndex
CREATE INDEX "KidsEnrollment_ativo_idx" ON "KidsEnrollment"("ativo");

-- CreateIndex
CREATE INDEX "KidsAuthorizedPickup_responsiblePersonId_idx" ON "KidsAuthorizedPickup"("responsiblePersonId");

-- CreateIndex
CREATE UNIQUE INDEX "KidsAuthorizedPickup_childId_responsiblePersonId_key" ON "KidsAuthorizedPickup"("childId", "responsiblePersonId");

-- CreateIndex
CREATE INDEX "KidsCheckIn_enrollmentId_idx" ON "KidsCheckIn"("enrollmentId");

-- CreateIndex
CREATE INDEX "KidsCheckIn_childId_idx" ON "KidsCheckIn"("childId");

-- CreateIndex
CREATE INDEX "KidsCheckIn_status_idx" ON "KidsCheckIn"("status");

-- AddForeignKey
ALTER TABLE "KidsClass" ADD CONSTRAINT "KidsClass_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsClass" ADD CONSTRAINT "KidsClass_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsClass" ADD CONSTRAINT "KidsClass_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsEnrollment" ADD CONSTRAINT "KidsEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "KidsClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsEnrollment" ADD CONSTRAINT "KidsEnrollment_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsAuthorizedPickup" ADD CONSTRAINT "KidsAuthorizedPickup_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsAuthorizedPickup" ADD CONSTRAINT "KidsAuthorizedPickup_responsiblePersonId_fkey" FOREIGN KEY ("responsiblePersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsCheckIn" ADD CONSTRAINT "KidsCheckIn_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "KidsEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsCheckIn" ADD CONSTRAINT "KidsCheckIn_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
