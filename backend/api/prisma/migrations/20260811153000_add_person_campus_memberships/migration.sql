-- CreateTable
CREATE TABLE "PersonCampusMembership" (
    "id" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "PersonCampusMembership_pkey" PRIMARY KEY ("id")
);

-- Preserve every current primary campus as an active campus link.
INSERT INTO "PersonCampusMembership" ("id", "ativo", "createdAt", "updatedAt", "personId", "campusId", "organizationId")
SELECT
    md5("Person"."id" || ':' || "Person"."campusId"),
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    "Person"."id",
    "Person"."campusId",
    COALESCE("Person"."organizationId", "Campus"."organizationId")
FROM "Person"
INNER JOIN "Campus" ON "Campus"."id" = "Person"."campusId"
WHERE COALESCE("Person"."organizationId", "Campus"."organizationId") IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PersonCampusMembership_personId_campusId_key" ON "PersonCampusMembership"("personId", "campusId");
CREATE INDEX "PersonCampusMembership_organizationId_campusId_idx" ON "PersonCampusMembership"("organizationId", "campusId");
CREATE INDEX "PersonCampusMembership_personId_ativo_idx" ON "PersonCampusMembership"("personId", "ativo");

-- AddForeignKey
ALTER TABLE "PersonCampusMembership" ADD CONSTRAINT "PersonCampusMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PersonCampusMembership" ADD CONSTRAINT "PersonCampusMembership_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PersonCampusMembership" ADD CONSTRAINT "PersonCampusMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
