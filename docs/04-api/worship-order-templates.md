# API: Modelos de Ordem de Culto

## Objetivo

Um modelo concentra a sequência recorrente de um culto — por exemplo, abertura, louvor, avisos e mensagem — para toda a organização. Ele é um ponto de partida: ao aplicá-lo a um evento, o sistema cria uma ordem de culto em rascunho com itens copiados.

Depois da cópia, a ordem do evento é independente. Por isso, um item excepcional como `Teatro Minuto` pode ser incluído, movido ou removido somente no culto de amanhã, sem alterar o modelo de domingo seguinte.

## Modelo de músicas do Culto Cachoeirinha

O painel disponibiliza a criação assistida do modelo **Culto Cachoeirinha · roteiro de músicas**. Ao escolher a Área de Música global, são criadas cinco posições editáveis vinculadas a essa área:

1. `Celebração · início do culto`
2. `Celebração ou POP`
3. `Oração`
4. `Dízimos e ofertas`
5. `Celebração · final do culto`

Elas são um ponto de partida. A Ordem de Culto de cada evento continua livre para receber, mover ou remover itens especiais.

## Regras

- A organização pode manter vários modelos, mas somente um modelo ativo pode ser marcado como padrão.
- Quando nenhum `templateId` é informado ao criar a ordem pelo modelo, o modelo padrão ativo é utilizado.
- O modelo precisa ter pelo menos um item e não pode perder o último item.
- Itens de um modelo podem apontar apenas para áreas de serviço globais, pois o mesmo modelo atende todos os campus.
- Ao aplicar o modelo, o evento precisa já envolver cada área indicada nos seus itens. Áreas locais e particularidades de um campus podem ser adicionadas diretamente na ordem daquele evento.
- Responsável, materiais e demandas não são copiados do modelo. Eles pertencem ao culto específico e continuam ajustáveis no rascunho.
- Desativar um modelo também remove sua condição de padrão. Ordens já criadas continuam preservadas e registram qual modelo as originou.
- O isolamento por `organizationId` é aplicado em todas as consultas e alterações.

## Permissões

`WORSHIP_ORDER_MANAGER`, `SECRETARY`, `ADMIN`, `SUPER_ADMIN` e `PASTOR_SENIOR` podem criar e manter modelos. Como os modelos são globais à organização, `PASTOR` não os administra diretamente. Qualquer usuário autenticado da organização pode consultá-los.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/worship-order-templates` | Cria um modelo e seus itens iniciais. |
| `GET` | `/worship-order-templates` | Lista os modelos da organização. |
| `GET` | `/worship-order-templates/:id` | Consulta um modelo. |
| `PATCH` | `/worship-order-templates/:id` | Renomeia, ativa/desativa ou define como padrão. |
| `POST` | `/worship-order-templates/:id/items` | Adiciona item ao modelo. |
| `PATCH` | `/worship-order-templates/items/:id` | Edita item do modelo. |
| `DELETE` | `/worship-order-templates/items/:id` | Remove item do modelo. |
| `PATCH` | `/worship-order-templates/:id/items/order` | Reordena todos os itens do modelo. |
| `POST` | `/worship-orders/from-template` | Cria a ordem de um culto usando o modelo padrão ou outro modelo ativo. |

## Criar o modelo padrão

```json
POST /worship-order-templates
{
  "nome": "Culto de domingo",
  "padrao": true,
  "items": [
    { "sequencia": 1, "titulo": "Abertura", "horario": "19:30" },
    { "sequencia": 2, "titulo": "Louvor", "horario": "19:35", "serviceAreaId": "uuid-da-area-global-de-musica" },
    { "sequencia": 3, "titulo": "Avisos", "horario": "20:05" },
    { "sequencia": 4, "titulo": "Mensagem", "horario": "20:15" }
  ]
}
```

## Criar a ordem do culto a partir do modelo

```json
POST /worship-orders/from-template
{
  "eventId": "uuid-do-culto-aprovado"
}
```

Para escolher um modelo ativo que não é o padrão, informe também `templateId`.

Em seguida, use os endpoints normais de itens da ordem para inserir o item especial no ponto exato:

```json
POST /worship-orders/uuid-da-ordem/items
{
  "sequencia": 3,
  "titulo": "Teatro Minuto",
  "horario": "20:00",
  "observacoes": "Apresentação antes dos avisos."
}
```
