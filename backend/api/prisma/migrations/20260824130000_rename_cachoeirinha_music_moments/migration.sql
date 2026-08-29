-- Atualiza somente o modelo assistido Cachoeirinha já existente.
-- Ordens de culto já criadas preservam o histórico do evento.
UPDATE "WorshipOrderTemplateItem"
SET "titulo" = CASE "titulo"
  WHEN 'Celebração · início do culto' THEN 'Música celebração'
  WHEN 'Celebração ou POP' THEN 'Música celebração ou POP'
  WHEN 'Oração' THEN 'Música oração'
  WHEN 'Dízimos e ofertas' THEN 'Música dízimos e ofertas'
  WHEN 'Celebração · final do culto' THEN 'Música final'
  ELSE "titulo"
END
WHERE "titulo" IN (
  'Celebração · início do culto',
  'Celebração ou POP',
  'Oração',
  'Dízimos e ofertas',
  'Celebração · final do culto'
)
AND "templateId" IN (
  SELECT "id"
  FROM "WorshipOrderTemplate"
  WHERE "nome" = 'Culto Cachoeirinha · roteiro de músicas'
);
