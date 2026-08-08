# API: Ordem de Culto

## Objetivo

Cada ordem de culto pertence a um único evento do tipo `WORSHIP`. Ela estrutura a sequência da celebração, seus materiais e as demandas dirigidas às áreas de serviço envolvidas.

## Fluxo

1. Um culto é cadastrado e aprovado na agenda.
2. A liderança autorizada cria a ordem em rascunho.
3. Itens, materiais e demandas são incluídos e organizados.
4. A ordem é publicada quando houver ao menos um item.
5. As áreas recebem notificações e registram a conclusão das demandas.

## Regras de domínio

- Só é permitida uma ordem por culto.
- O culto precisa ser um evento `WORSHIP` aprovado da organização atual.
- A sequência é única dentro da mesma ordem.
- Itens, materiais, demandas, edições, exclusões e reordenações só são permitidos em `DRAFT`.
- A reordenação deve receber todos os itens da ordem, com sequências únicas.
- Ao excluir um item, seus materiais e demandas também são removidos.
- Depois de publicada, a ordem não recebe alterações; demandas pendentes ainda podem ser concluídas ou canceladas.
- A área indicada em item ou demanda deve estar ativa, disponível no campus e vinculada ao evento de culto.
- O responsável de uma demanda deve ser uma pessoa ativa com vínculo ativo na área indicada.
- Todos os acessos verificam o `organizationId` do usuário autenticado.

## Permissões

- `WORSHIP_ORDER_MANAGER`, `SECRETARY`, `ADMIN`, `SUPER_ADMIN` e `PASTOR` podem montar, editar e publicar ordens em todos os campus da organização.
- O criador do evento e a pessoa responsável pelo evento também podem montar a ordem.
- Qualquer usuário autenticado pode consultar uma ordem da própria organização.
- O responsável por uma demanda pode concluí-la; a liderança que monta a ordem também pode concluí-la ou cancelá-la.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/worship-orders` | Cria uma ordem para um culto aprovado. |
| `GET` | `/worship-orders/event/:eventId` | Consulta a ordem pelo evento de culto. |
| `GET` | `/worship-orders/:id` | Consulta uma ordem completa. |
| `POST` | `/worship-orders/:id/items` | Adiciona item ao rascunho. |
| `PATCH` | `/worship-orders/items/:id` | Edita um item do rascunho. |
| `DELETE` | `/worship-orders/items/:id` | Exclui um item do rascunho. |
| `PATCH` | `/worship-orders/:id/items/order` | Reordena todos os itens. |
| `POST` | `/worship-orders/items/:id/materials` | Adiciona material a um item. |
| `POST` | `/worship-orders/items/:id/demands` | Cria uma demanda por área. |
| `PATCH` | `/worship-orders/:id/publish` | Publica a ordem. |
| `PATCH` | `/worship-orders/demands/:id/complete` | Conclui uma demanda pendente. |
| `PATCH` | `/worship-orders/demands/:id/cancel` | Cancela uma demanda pendente. |

### Criar ordem

```json
POST /worship-orders
{
  "eventId": "uuid-do-culto"
}
```

### Adicionar ou editar item

```json
{
  "sequencia": 1,
  "titulo": "Louvor",
  "horario": "19:45",
  "responsiblePersonId": "uuid-da-pessoa",
  "serviceAreaId": "uuid-da-area",
  "observacoes": "Encerrar com transição para os avisos."
}
```

Para editar, envie apenas os campos que devem mudar em `PATCH /worship-orders/items/:id`.

### Reordenar itens

```json
PATCH /worship-orders/:id/items/order
{
  "items": [
    { "id": "uuid-item-abertura", "sequencia": 1 },
    { "id": "uuid-item-louvor", "sequencia": 2 }
  ]
}
```

### Adicionar material

`type` aceita `CARD`, `VIDEO`, `PRESENTATION`, `MUSIC`, `PRO_PRESENTER` ou `OTHER`.

```json
POST /worship-orders/items/:id/materials
{
  "type": "PRO_PRESENTER",
  "titulo": "Letras do repertório",
  "referencia": "https://exemplo/arquivo"
}
```

### Criar demanda

```json
POST /worship-orders/items/:id/demands
{
  "descricao": "Enviar repertório final para a produção.",
  "serviceAreaId": "uuid-da-area-de-musica",
  "responsiblePersonId": "uuid-do-responsavel",
  "dueAt": "2026-08-13T18:00:00.000Z"
}
```

## Notificações

- Ao criar uma demanda, todos os integrantes ativos da área de serviço indicada recebem uma notificação interna.
- Ao publicar a ordem, os integrantes das áreas vinculadas ao culto recebem uma notificação interna.
- Demandas concluídas ou canceladas preservam o status para acompanhamento da liderança.

## Função Responsável por Ordem de Culto

`WORSHIP_ORDER_MANAGER` é uma função adicional organizacional. Um administrador pode concedê-la sem substituir a função principal:

```json
POST /users/:id/roles
{
  "role": "WORSHIP_ORDER_MANAGER"
}
```
