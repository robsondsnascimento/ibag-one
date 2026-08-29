-- O roteiro confirmado da IBAG possui cinco momentos de música.
-- Atualiza somente o modelo assistido; ordens históricas permanecem inalteradas.
WITH "music_area_by_template" AS (
  SELECT DISTINCT ON ("templateId")
    "templateId",
    "serviceAreaId"
  FROM "WorshipOrderTemplateItem"
  WHERE "serviceAreaId" IS NOT NULL
    AND "templateId" IN (
      SELECT "id"
      FROM "WorshipOrderTemplate"
      WHERE "nome" = 'Culto Cachoeirinha · roteiro de músicas'
    )
  ORDER BY "templateId", "sequencia"
)
UPDATE "WorshipOrderTemplateItem" AS "item"
SET
  "titulo" = CASE "item"."titulo"
    WHEN 'Celebração de início' THEN 'Música celebração'
    WHEN 'Música celebração' THEN 'Música celebração'
    WHEN 'Celebração ou POP' THEN 'Música celebração ou POP'
    WHEN 'Música celebração ou POP' THEN 'Música celebração ou POP'
    WHEN 'Oração' THEN 'Música oração'
    WHEN 'Música oração' THEN 'Música oração'
    WHEN 'Dízimos e ofertas' THEN 'Música dízimos e ofertas'
    WHEN 'Música dízimos e ofertas' THEN 'Música dízimos e ofertas'
    WHEN 'Celebração final' THEN 'Música final'
    WHEN 'Música final' THEN 'Música final'
    ELSE "item"."titulo"
  END,
  "serviceAreaId" = "music_area_by_template"."serviceAreaId"
FROM "music_area_by_template"
WHERE "item"."templateId" = "music_area_by_template"."templateId"
  AND "item"."titulo" IN (
    'Celebração de início',
    'Música celebração',
    'Celebração ou POP',
    'Música celebração ou POP',
    'Oração',
    'Música oração',
    'Dízimos e ofertas',
    'Música dízimos e ofertas',
    'Celebração final',
    'Música final'
  );
