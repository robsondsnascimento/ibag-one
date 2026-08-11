# API: Funções de Usuário

## Modelo de acesso

Cada pessoa possui uma função principal (`role`) e pode receber funções adicionais. As funções adicionais somam permissões e não substituem a função principal.

O login pertence à organização, e não a um campus: a mesma conta acessa a IBAG uma única vez. Uma pessoa possui um **campus principal** e pode ter vínculos ativos com um ou mais campi da mesma organização, sem duplicar seu cadastro ou seu login. A visualização de Cachoeirinha, Esteio ou de ambos é definida pelas permissões e vínculos da pessoa. Funções centrais e `PASTOR_SENIOR` alcançam todos os campi da organização; `PASTOR`, lideranças de equipes e demais funções com escopo limitado veem somente os campi, áreas e equipes para os quais possuem autorização. Pessoas não são replicadas entre campi.

O papel `PASTOR` opera nos campi ativos vinculados à pessoa nos fluxos pastorais, Eventos, Ordem de Culto, Repertório, IBAG Kids, notificações e famílias. `PASTOR_SENIOR` tem as mesmas responsabilidades pastorais com alcance em todos os campi da organização. Ambos podem receber funções adicionais, como `WORSHIP_ORDER_MANAGER`.

Modelos de Ordem de Culto são recursos globais da organização; por isso sua gestão é reservada ao `PASTOR_SENIOR` e às funções centrais.

O vínculo de coordenador de células não é um papel global: ele é registrado por campus e permanece subordinado ao pastor nos cuidados pastorais.

## Gestão

Somente `ADMIN` e `SUPER_ADMIN` podem conceder ou remover funções adicionais. O registro preserva a data e o usuário que realizou a concessão.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/users` | Lista usuários, sua função principal e o conjunto `roles` com todas as funções efetivas. |
| `GET` | `/users/persons/:personId` | Consulta o acesso já concedido a uma pessoa. |
| `POST` | `/users/persons/:personId` | Cria o acesso inicial de uma pessoa ativa da organização. |
| `PATCH` | `/users/:id/role` | Altera somente a função principal. |
| `POST` | `/users/:id/roles` | Concede uma função adicional. |
| `DELETE` | `/users/:id/roles/:role` | Remove uma função adicional. |

### Liberar acesso para uma pessoa

No cadastro da pessoa, `ADMIN` ou `SUPER_ADMIN` pode decidir se ela receberá login. A rota abaixo cria um usuário com a função principal `MEMBER`; o nome de usuário é gerado a partir do nome da pessoa e do domínio institucional, com um sufixo numérico caso já exista outro igual.

```json
POST /users/persons/:personId
{
  "password": "senha-inicial"
}
```

O campo `personId` vem da URL, e o `organizationId` vem exclusivamente da sessão autenticada. Uma pessoa só pode possuir um usuário vinculado.

### Conceder Responsável por Ordem de Culto

```json
POST /users/:id/roles
{
  "role": "WORSHIP_ORDER_MANAGER"
}
```

Essa função permite montar, publicar e concluir demandas de ordens de culto em todos os campus da organização, sem ampliar outras permissões administrativas.
