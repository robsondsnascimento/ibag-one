# Redes e supervisão de células

As redes organizam as células dentro de um campus. Cada célula pertence, no máximo, a uma rede e nunca pode ser vinculada a uma rede de outro campus.

## Permissões

| Operação | Papéis autorizados |
| --- | --- |
| Consultar redes | Secretaria, administração, superadmin e pastor sênior em todos os campus; pastor no próprio campus; coordenador nos campus que coordena. |
| Criar, alterar, inativar redes ou vincular células | `SECRETARY`, `ADMIN`, `SUPER_ADMIN`, `PASTOR` no próprio campus e `PASTOR_SENIOR` em todos os campus. |
| Atribuir ou encerrar supervisão | Os papéis acima e o coordenador ativo nos campus sob sua coordenação. |

## Regras

- Uma rede pertence a um único campus e uma célula vinculada deve pertencer ao mesmo campus.
- Não pode haver duas redes ativas com o mesmo nome no mesmo campus.
- Uma rede inativa não recebe novas células.
- Cada rede pode possuir até dois supervisores ativos, sempre pessoas distintas.
- A coordenação e a supervisão são vínculos históricos: ao encerrar, o registro é preservado.
- No painel, uma célula é removida explicitamente antes de ser vinculada a outra rede, evitando transferência acidental.

## Rotas de redes

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/cell-networks` | Lista as redes acessíveis ao usuário. |
| `POST` | `/cell-networks` | Cria uma rede com `nome`, `campusId` e `descricao` opcional. |
| `GET` | `/cell-networks/:id` | Consulta uma rede e suas células. |
| `PATCH` | `/cell-networks/:id` | Altera os dados permitidos da rede. |
| `DELETE` | `/cell-networks/:id` | Inativa a rede, preservando o histórico. |
| `PATCH` | `/cell-networks/:id/cells/:cellId` | Vincula uma célula da mesma organização e campus. |
| `DELETE` | `/cell-networks/:id/cells/:cellId` | Remove o vínculo da célula com a rede. |

## Rotas de supervisão

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/cell-network-supervisions` | Lista supervisões no escopo do usuário. |
| `POST` | `/cell-network-supervisions` | Atribui uma pessoa ativa a uma rede ativa. |
| `PATCH` | `/cell-network-supervisions/:id/end` | Encerra a supervisão atual. |
| `PATCH` | `/cell-network-supervisions/:id/transfer` | Move o supervisor para outra rede permitida, mantendo o histórico. |
