# API: Funções Operacionais de Equipe (compatibilidade)

## Objetivo

As funções operacionais preservam atribuições históricas de equipe. Elas não substituem `MEMBER`, `TEAM_LEADER`, `CAMPUS_LEADER` ou `GENERAL_LEADER`.

Para novos cadastros, o **Ministro de Louvor** é definido pela função de serviço `Ministro` no vínculo ativo da pessoa com a equipe de Música. Essa é a configuração exibida e administrada pelo painel; ela autoriza preparar, enviar e ajustar o próprio repertório quando a escala da mesma equipe estiver confirmada.

## Regras

- A pessoa precisa ser integrante ativo da mesma equipe para possuir a função `Ministro`.
- A função pertence à equipe, não é uma função geral do usuário.
- Liderança geral, de campus, da equipe ou gestão central pode editar as funções de serviço dos integrantes dentro do seu escopo.
- Enquanto a função estiver ativa, o Ministro de Louvor pode operar somente os repertórios que ele próprio criou.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/service-areas/teams/:teamId/operational-roles` | Atribui uma função operacional a um integrante. |
| `GET` | `/service-areas/teams/:teamId/operational-roles` | Lista funções ativas da equipe. |
| `PATCH` | `/service-areas/operational-roles/:id/end` | Encerra uma atribuição operacional. |

## Endpoints legados

Os endpoints abaixo permanecem disponíveis para compatibilidade com atribuições `WORSHIP_MINISTER` já registradas. A aplicação ainda as reconhece no repertório, mas novos ministros devem ser cadastrados pela função de serviço `Ministro`.

## Atribuir Ministro de Louvor (legado)

```json
POST /service-areas/teams/uuid-da-equipe-de-louvor/operational-roles
{
  "personId": "uuid-do-participante",
  "role": "WORSHIP_MINISTER"
}
```
