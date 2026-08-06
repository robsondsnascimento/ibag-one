-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dominio" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_dominio_key"
ON "Organization"("dominio");


-- Criar organização inicial IBAG
INSERT INTO "Organization"
(
    "id",
    "nome",
    "dominio",
    "ativo",
    "createdAt",
    "updatedAt"
)
VALUES
(
    'org_ibag_one',
    'IBAG',
    'ibag.one',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


-- Adicionar coluna temporária
ALTER TABLE "Campus"
ADD COLUMN "organizationId" TEXT;

ALTER TABLE "Person"
ADD COLUMN "organizationId" TEXT;

ALTER TABLE "User"
ADD COLUMN "organizationId" TEXT;


-- Associar registros existentes ao IBAG

UPDATE "Campus"
SET "organizationId" = 'org_ibag_one';


UPDATE "Person"
SET "organizationId" = 'org_ibag_one';


UPDATE "User"
SET "organizationId" = 'org_ibag_one';


-- Criar relacionamentos

ALTER TABLE "Campus"
ADD CONSTRAINT "Campus_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Organization"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "Person"
ADD CONSTRAINT "Person_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Organization"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "User"
ADD CONSTRAINT "User_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Organization"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


-- Tornar obrigatório após migração dos dados

ALTER TABLE "Campus"
ALTER COLUMN "organizationId" SET NOT NULL;


ALTER TABLE "Person"
ALTER COLUMN "organizationId" SET NOT NULL;


ALTER TABLE "User"
ALTER COLUMN "organizationId" SET NOT NULL;
