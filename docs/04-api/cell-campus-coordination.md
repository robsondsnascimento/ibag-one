# Coordenação de Células

O módulo registra a atribuição histórica de um coordenador de células a um campus. A atribuição não é um papel global de usuário: ela determina o escopo ministerial da pessoa dentro da estrutura de células.

## Rotas

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/cell-campus-coordinations` | Inicia a coordenação de uma pessoa em um campus. |
| `GET` | `/cell-campus-coordinations` | Lista coordenações visíveis ao usuário. |
| `GET` | `/cell-campus-coordinations/:id` | Consulta uma coordenação. |
| `PATCH` | `/cell-campus-coordinations/:id/end` | Encerra uma coordenação ativa, preservando o histórico. |
| `PATCH` | `/cell-campus-coordinations/:id/transfer` | Encerra o vínculo atual e inicia outro no campus de destino. |

## Dados de entrada

Para criar:

```json
{
  "personId": "uuid-da-pessoa",
  "campusId": "uuid-do-campus"
}
```

Para transferir:

```json
{
  "campusId": "uuid-do-campus-de-destino"
}
```

## Regras

- Somente `PASTOR`, `PASTOR_SENIOR`, `SECRETARY`, `ADMIN` e `SUPER_ADMIN` iniciam, encerram ou transferem coordenações; o pastor opera apenas em seu próprio campus e o pastor sênior em todos os campi.
- A pessoa e o campus precisam estar ativos e pertencer à organização atual.
- A mesma pessoa não pode ter duas coordenações ativas no mesmo campus.
- O histórico é preservado por `inicio`, `fim` e `ativo`.
- Um coordenador pode consultar apenas os registros dos campi que coordena.
- Nas redes desses campi, o coordenador pode criar, encerrar e transferir supervisões; a regra de apenas um supervisor ativo por rede continua obrigatória.
- No painel pastoral, o coordenador vê somente dados de seus campi.
- No cuidado pastoral, ele atende somente pessoas com vínculo ativo em células de seus campi. O pastor do campus possui escopo mais amplo e pode atender também pessoas sem vínculo de célula.
