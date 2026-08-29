-- Preserva se a data de ingresso foi informada apenas com mês e ano.
-- Quando o dia não é conhecido, dataMembresia é armazenada no primeiro dia do mês.
ALTER TABLE "Person"
ADD COLUMN "dataMembresiaSemDia" BOOLEAN NOT NULL DEFAULT false;
