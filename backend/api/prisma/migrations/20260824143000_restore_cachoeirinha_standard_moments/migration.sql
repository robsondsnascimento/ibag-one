-- Restaura o modelo assistido Cachoeirinha: somente três posições são musicais.
-- Ordens de culto já criadas preservam o histórico de cada celebração.
UPDATE "WorshipOrderTemplateItem"
SET
  "titulo" = CASE "titulo"
    WHEN 'Música celebração' THEN 'Celebração de início'
    WHEN 'Música celebração ou POP' THEN 'Celebração ou POP'
    WHEN 'Música oração' THEN 'Oração'
    WHEN 'Música dízimos e ofertas' THEN 'Dízimos e ofertas'
    WHEN 'Música final' THEN 'Celebração final'
    ELSE "titulo"
  END,
  "serviceAreaId" = CASE
    WHEN "titulo" IN ('Música oração', 'Oração', 'Música dízimos e ofertas', 'Dízimos e ofertas') THEN NULL
    ELSE "serviceAreaId"
  END
WHERE "titulo" IN (
  'Música celebração',
  'Música celebração ou POP',
  'Música oração',
  'Música dízimos e ofertas',
  'Música final',
  'Celebração de início',
  'Celebração ou POP',
  'Oração',
  'Dízimos e ofertas',
  'Celebração final'
)
AND "templateId" IN (
  SELECT "id"
  FROM "WorshipOrderTemplate"
  WHERE "nome" = 'Culto Cachoeirinha · roteiro de músicas'
);
