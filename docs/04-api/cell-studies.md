# Estudos semanais de célula

O estudo é único por organização e por semana. Ele é publicado pela Secretaria e fica disponível para membros de todas as células, independentemente do campus.

## Regra de disponibilidade

O estudo da semana atual somente é liberado para o membro quando o registro do encontro da semana anterior da sua própria célula estiver concluído.

- A semana é considerada de segunda-feira a domingo; a data de publicação é normalizada para a segunda-feira correspondente.
- O encontro atual continua sendo gerado pela agenda semanal da célula e não depende do registro anterior.
- Se a célula for nova e ainda não possuir encontro na semana anterior, o estudo pode ser liberado normalmente.
- Se não houver estudo publicado para a semana, o sistema informa que a publicação ainda não foi realizada.

## Permissões

| Ação | Papéis autorizados |
| --- | --- |
| Consultar ou baixar o estudo atual | Pessoa com vínculo ativo em uma célula, observada a regra de disponibilidade |
| Consultar publicação por semana | `SECRETARY`, `SUPER_ADMIN` |
| Publicar estudo e anexo | `SECRETARY`, `SUPER_ADMIN` |

## Rotas

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/cell-studies?weekStart=YYYY-MM-DD` | Consulta o estudo de uma semana para publicação e conferência da Secretaria. Sem o parâmetro, usa a semana atual. |
| `POST` | `/cell-studies` | Publica o estudo. Recebe `multipart/form-data` com `titulo`, `weekStart`, `descricao` opcional e `file`. |
| `GET` | `/cell-studies/current` | Obtém o estudo disponível para o membro autenticado. |
| `GET` | `/cell-studies/current/download` | Baixa o anexo do estudo disponível para o membro autenticado. |

O banco garante uma única publicação por organização e semana. Uma segunda tentativa de publicação para a mesma semana retorna `409 Conflict`, preservando uma fonte única de estudo para toda a IBAG.
