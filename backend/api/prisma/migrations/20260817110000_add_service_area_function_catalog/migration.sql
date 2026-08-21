ALTER TABLE "ServiceArea" ADD COLUMN "funcoes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "ServiceArea"
SET "funcoes" = ARRAY['Ministro', 'Backing Vocal', 'Guitarra', 'Violão', 'Baixo', 'Tecladista', 'Bateria', 'Percussão']
WHERE lower("nome") IN ('música', 'musica', 'ministério de música', 'ministerio de musica');
