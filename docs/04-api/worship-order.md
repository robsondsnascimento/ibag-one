# API: Ordem de Culto

## Objetivo

Cada ordem de culto pertence a um Ãºnico evento do tipo `WORSHIP`. Ela estrutura a sequÃªncia da celebraÃ§Ã£o, os materiais necessÃ¡rios e as demandas direcionadas Ã s Ã¡reas de serviÃ§o envolvidas.

## Fluxo

1. Um culto Ã© cadastrado e aprovado na agenda.
2. A secretaria, administraÃ§Ã£o, pastoral, criador do evento ou responsÃ¡vel pelo culto cria a ordem.
3. Enquanto estiver em rascunho, sÃ£o adicionados itens, materiais e demandas.
4. A ordem Ã© publicada quando houver pelo menos um item.
5. O responsÃ¡vel de cada demanda, ou a lideranÃ§a que monta a ordem, registra sua conclusÃ£o.

## Regras de domÃ­nio

- SÃ³ Ã© permitida uma ordem por culto.
- O culto precisa ser um evento `WORSHIP` aprovado e da organizaÃ§Ã£o do usuÃ¡rio.
- A sequÃªncia Ã© Ãºnica dentro da mesma ordem.
- Itens e demandas sÃ³ podem ser incluÃ­dos enquanto a ordem estiver em `DRAFT`.
- Depois de publicada, a ordem nÃ£o recebe alteraÃ§Ãµes; demandas pendentes ainda podem ser concluÃ­das.
- Uma Ã¡rea indicada em item ou demanda deve estar ativa, disponÃ­vel no campus e jÃ¡ vinculada ao evento de culto.
- O responsÃ¡vel de uma demanda deve ser uma pessoa ativa e ter vÃ­nculo ativo com a Ã¡rea indicada.
- Todos os acessos verificam o `organizationId` proveniente do token.

## PermissÃµes para montar a ordem

- `WORSHIP_ORDER_MANAGER` (ResponsÃ¡vel por Ordem de Culto), `SECRETARY`, `ADMIN`, `SUPER_ADMIN` e `PASTOR` podem montar e publicar ordens de culto em todos os campus da organizaÃ§Ã£o.
- O usuÃ¡rio que criou o evento e a pessoa definida como responsÃ¡vel pelo evento tambÃ©m podem fazer isso.
- Qualquer usuÃ¡rio autenticado pode consultar uma ordem da sua organizaÃ§Ã£o.
- A pessoa responsÃ¡vel por uma demanda pode concluÃ­-la; a lideranÃ§a que pode montar a ordem tambÃ©m pode concluÃ­-la.

## FunÃ§Ã£o ResponsÃ¡vel por Ordem de Culto

Essa Ã© uma funÃ§Ã£o organizacional, normalmente atribuÃ­da Ã  pessoa que centraliza as ordens dos cultos da IBAG. Um administrador pode concedÃª-la pela rota existente `PATCH /users/:id/role`, enviando `"role": "WORSHIP_ORDER_MANAGER"`. A permissÃ£o vale para todos os campus da mesma organizaÃ§Ã£o e nÃ£o concede permissÃµes administrativas fora do mÃ³dulo de Ordem de Culto.

## Endpoints

| MÃ©todo | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/worship-orders` | Cria uma ordem para um culto aprovado. |
| `GET` | `/worship-orders/event/:eventId` | Consulta a ordem pelo evento de culto. |
| `GET` | `/worship-orders/:id` | Consulta uma ordem completa. |
| `POST` | `/worship-orders/:id/items` | Adiciona um item ao rascunho. |
| `POST` | `/worship-orders/items/:id/materials` | Adiciona material a um item. |
| `POST` | `/worship-orders/items/:id/demands` | Cria uma demanda por Ã¡rea. |
| `PATCH` | `/worship-orders/:id/publish` | Publica a ordem. |
| `PATCH` | `/worship-orders/demands/:id/complete` | Conclui uma demanda pendente. |

### Criar ordem

```json
POST /worship-orders
{
  "eventId": "uuid-do-culto"
}
```

### Adicionar item

```json
POST /worship-orders/:id/items
{
  "sequencia": 1,
  "titulo": "Louvor",
  "horario": "19:45",
  "responsiblePersonId": "uuid-da-pessoa",
  "serviceAreaId": "uuid-da-area",
  "observacoes": "Encerrar com transiÃ§Ã£o para os avisos."
}
```

### Adicionar material

`type` aceita `CARD`, `VIDEO`, `PRESENTATION`, `MUSIC`, `PRO_PRESENTER` ou `OTHER`.

```json
POST /worship-orders/items/:id/materials
{
  "type": "PRO_PRESENTER",
  "titulo": "Letras do repertÃ³rio",
  "referencia": "https://exemplo/arquivo"
}
```

### Criar demanda

```json
POST /worship-orders/items/:id/demands
{
  "descricao": "Enviar repertÃ³rio final para a produÃ§Ã£o.",
  "serviceAreaId": "uuid-da-area-de-musica",
  "responsiblePersonId": "uuid-do-responsavel",
  "dueAt": "2026-08-13T18:00:00.000Z"
}
```
