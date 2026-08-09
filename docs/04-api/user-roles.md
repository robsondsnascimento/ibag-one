# API: Funções de Usuário

## Modelo de acesso

Cada pessoa possui uma função principal (`role`) e pode receber funções adicionais. As funções adicionais somam permissões e não substituem a função principal.

O papel `PASTOR` está ligado ao campus da pessoa e opera nesse escopo nos fluxos pastorais, Eventos, Ordem de Culto, Repertório, IBAG Kids, notificações e famílias. `PASTOR_SENIOR` tem as mesmas responsabilidades pastorais com alcance em todos os campi da organização. Ambos podem receber funções adicionais, como `WORSHIP_ORDER_MANAGER`.

Modelos de Ordem de Culto são recursos globais da organização; por isso sua gestão é reservada ao `PASTOR_SENIOR` e às funções centrais.

O vínculo de coordenador de células não é um papel global: ele é registrado por campus e permanece subordinado ao pastor nos cuidados pastorais.

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
