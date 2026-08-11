# API: Áreas de Serviço e Equipes

## Objetivo

Áreas de Serviço organizam o voluntariado da organização. Uma área pode ser global ou de campus; uma equipe sempre pertence a uma área e a um campus. Nome, descrição e disponibilidade podem ser atualizados sem alterar esse contexto estrutural.

## Regras de disponibilidade

- `GET /service-areas` retorna somente áreas ativas para a operação normal.
- A gestão central pode solicitar `GET /service-areas?includeInactive=true` para administrar e reativar áreas inativas.
- Ao inativar uma área, as equipes ativas vinculadas são inativadas na mesma transação. Nenhum vínculo, função, escala ou histórico é excluído.
- Reativar a área não reativa suas equipes automaticamente.
- Uma equipe não pode ser reativada enquanto sua área estiver inativa.
- Áreas e equipes inativas não recebem novos vínculos, funções operacionais ou escalas.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/service-areas` | Lista as áreas ativas da organização. |
| `GET` | `/service-areas?includeInactive=true` | Lista áreas ativas e inativas para secretaria, administração ou super administração. |
| `GET` | `/service-areas/:id` | Consulta uma área e suas equipes; uma área inativa é acessível somente pela gestão central. |
| `PATCH` | `/service-areas/:id` | Atualiza nome, descrição ou status da área; restrito à gestão central. |
| `PATCH` | `/service-areas/teams/:id` | Atualiza nome, descrição ou status de uma equipe, respeitando o escopo da liderança. |

## Exemplo

```json
PATCH /service-areas/uuid-da-area
{
  "nome": "Música",
  "descricao": "Louvor e apoio musical dos cultos.",
  "ativo": false
}
```
