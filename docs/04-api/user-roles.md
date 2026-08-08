# API: Funções de Usuário

## Modelo de acesso

Cada pessoa possui uma função principal (`role`) e pode receber funções adicionais. As funções adicionais somam permissões e não substituem a função principal.

Exemplo: uma pessoa com função principal `PASTOR` pode receber também `WORSHIP_ORDER_MANAGER` para montar as ordens de culto de todos os campus.

## Gestão

Somente `ADMIN` e `SUPER_ADMIN` podem conceder ou remover funções adicionais. O registro preserva a data e o usuário que realizou a concessão.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/users` | Lista usuários, sua função principal e o conjunto `roles` com todas as funções efetivas. |
| `PATCH` | `/users/:id/role` | Altera somente a função principal. |
| `POST` | `/users/:id/roles` | Concede uma função adicional. |
| `DELETE` | `/users/:id/roles/:role` | Remove uma função adicional. |

### Conceder Responsável por Ordem de Culto

```json
POST /users/:id/roles
{
  "role": "WORSHIP_ORDER_MANAGER"
}
```

Essa função permite montar, publicar e concluir demandas de ordens de culto em todos os campus da organização, sem ampliar outras permissões administrativas.
