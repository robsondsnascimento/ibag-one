ALTER TABLE "KidsCheckIn" ADD COLUMN "pickupCode" TEXT;
CREATE UNIQUE INDEX "KidsCheckIn_pickupCode_key" ON "KidsCheckIn"("pickupCode");
CREATE TABLE "KidsIdentity" (
  "id" TEXT NOT NULL,
  "qrCode" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "childId" TEXT NOT NULL,
  CONSTRAINT "KidsIdentity_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "KidsIdentity_qrCode_key" ON "KidsIdentity"("qrCode");
CREATE UNIQUE INDEX "KidsIdentity_childId_key" ON "KidsIdentity"("childId");
ALTER TABLE "KidsIdentity" ADD CONSTRAINT "KidsIdentity_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
