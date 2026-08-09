# API: Funções Operacionais de Equipe

## Objetivo

Uma função operacional complementa o vínculo normal de uma pessoa em uma equipe. Ela não substitui `MEMBER`, `TEAM_LEADER`, `CAMPUS_LEADER` ou `GENERAL_LEADER`; apenas libera uma tarefa específica.

No fluxo de culto, `WORSHIP_MINISTER` representa o **Ministro de Louvor**: um integrante da equipe de louvor autorizado a preparar, enviar e ajustar o repertório do culto.

## Regras

- A pessoa precisa ser integrante ativo da mesma equipe antes de receber a função.
- A função pertence à equipe, não é uma função geral do usuário.
- Liderança geral, de campus, da equipe ou gestão central pode atribuir e encerrar a função.
- Enquanto a atribuição estiver ativa, o Ministro de Louvor pode operar somente os repertórios que ele próprio criou.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/service-areas/teams/:teamId/operational-roles` | Atribui uma função operacional a um integrante. |
| `GET` | `/service-areas/teams/:teamId/operational-roles` | Lista funções ativas da equipe. |
| `PATCH` | `/service-areas/operational-roles/:id/end` | Encerra uma atribuição operacional. |

## Atribuir Ministro de Louvor

```json
POST /service-areas/teams/uuid-da-equipe-de-louvor/operational-roles
{
  "personId": "uuid-do-participante",
  "role": "WORSHIP_MINISTER"
}
```
