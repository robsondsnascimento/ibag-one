# API: Escalas de Serviço

## Objetivo

Uma escala pertence à área de serviço e à equipe da pessoa escalada, como Louvor, Dança, Multimídia ou Som. Ela pode ser associada a um **Culto aprovado** do mesmo campus da equipe, mas não pertence à Ordem de Culto. A Ordem de Culto apenas consulta as escalas do seu evento.

Uma pessoa recebe apenas uma escala por equipe e horário. A função de serviço **Ministro** é complementar: uma pessoa pode ser escalada como `Tecladista` e também ser Ministro de Louvor, sem gerar uma segunda escala nem conflito de agenda. A função é válida somente na equipe em que foi cadastrada e libera o repertório quando houver escala confirmada no culto.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/service-areas/teams/:teamId/schedules` | Cria uma escala individual para a equipe. |
| `POST` | `/service-areas/teams/:teamId/schedules/batch` | Cria até 100 escalas em um único lote. |
| `GET` | `/service-areas/:areaId/schedules?start&end&teamId&status` | Visão consolidada das escalas da área de serviço. |
| `GET` | `/service-areas/:areaId/unavailabilities?start&end` | Lista indisponibilidades no período e dentro do escopo de equipes da pessoa conectada. |
| `POST` | `/service-areas/:areaId/unavailabilities` | Registra a indisponibilidade da própria pessoa em uma data. |
| `DELETE` | `/service-areas/:areaId/unavailabilities/:id` | Retira uma indisponibilidade da própria pessoa. |
| `GET` | `/service-areas/teams/:teamId/schedules?start&end` | Lista as escalas de uma equipe por período. |
| `GET` | `/service-areas/schedules/me?start&end` | Lista as escalas da própria pessoa autenticada. |
| `GET` | `/service-areas/events/:eventId/schedules` | Lista, em modo de consulta, as escalas do evento. |
| `GET` | `/service-areas/schedules/:id/history` | Consulta o histórico auditável da escala. |
| `PATCH` | `/service-areas/schedules/:id/status` | Confirma, recusa, conclui ou reabre uma escala conforme a permissão. |
| `PATCH` | `/service-areas/schedules/:id/substitute` | Substitui a pessoa escalada e solicita nova confirmação. |
| `GET` | `/service-areas/:areaId/schedule-notes?start&end` | Lista as observações gerais da grade por culto/data e Campus. |
| `PATCH` | `/service-areas/:areaId/schedule-notes` | Cria, altera ou limpa a observação geral de uma coluna da grade. |
| `DELETE` | `/service-areas/schedules/:id` | Remove a pessoa da escala, preservando o histórico auditável. |
| `GET` | `/service-areas/schedules/:id/swap-candidates` | Lista integrantes disponíveis com a mesma função da escala. |
| `POST` | `/service-areas/schedules/:id/swap-requests` | A pessoa escalada solicita uma troca para um integrante indicado. |
| `GET` | `/service-areas/teams/:teamId/swap-requests` | Lista solicitações pendentes para a liderança da equipe. |
| `PATCH` | `/service-areas/swap-requests/:id/approve` | Aprova a troca e efetiva a substituição na escala. |
| `PATCH` | `/service-areas/swap-requests/:id/reject` | Recusa a troca, mantendo a escala original. |

Os status operacionais são `SCHEDULED`, `CONFIRMED`, `DECLINED` e `COMPLETED`. O status interno `REMOVED` preserva a auditoria de uma pessoa retirada e não aparece nas consultas operacionais.

## Criação individual e em lote

Para escalar uma pessoa em um Culto, informe `eventId`. O Culto precisa estar aprovado e pertencer ao campus da equipe. O painel mostra esses cultos em agenda mensal, por equipe. Se `eventId` for omitido, a API cria a escala na data informada e procura um Culto aprovado no mesmo campus e horário: ao encontrar, vincula-o automaticamente. Ao criar, aprovar ou alterar um Culto aprovado, a API também associa as escalas independentes preexistentes que coincidam exatamente em campus e horário.

```json
POST /service-areas/teams/:teamId/schedules
{
  "personId": "uuid-da-pessoa",
  "data": "2026-08-09T19:00:00.000Z",
  "funcao": "Ministro",
  "eventId": "uuid-do-culto"
}
```

O lote recebe os mesmos dados por item e é atômico: se uma escala for inválida, nenhuma será criada.

```json
POST /service-areas/teams/:teamId/schedules/batch
{
  "schedules": [
    {
      "personId": "uuid-ministro",
      "data": "2026-08-09T19:00:00.000Z",
      "funcao": "Ministro",
      "eventId": "uuid-do-culto"
    },
    {
      "personId": "uuid-guitarra",
      "data": "2026-08-09T19:00:00.000Z",
      "funcao": "Guitarra",
      "eventId": "uuid-do-culto"
    }
  ]
}
```

## Confirmação e recusa

A própria pessoa escalada pode alterar a sua escala apenas para `CONFIRMED` ou `DECLINED`. Lideranças autorizadas da área podem administrar todos os status. Uma escala concluída não pode receber uma nova resposta da pessoa escalada.

```json
PATCH /service-areas/schedules/:scheduleId/status
{
  "status": "DECLINED",
  "reason": "Estarei fora da cidade neste fim de semana."
}
```

O motivo é opcional e aceito apenas em uma recusa. Quando há recusa, o sistema registra um alerta interno para a liderança geral, a liderança de campus aplicável e a liderança da equipe. Esses registros serão a origem das futuras entregas por WhatsApp e ProPresenter; nenhuma integração externa é disparada neste momento.

## Substituição

Somente quem pode gerenciar a equipe pode substituir uma pessoa. A pessoa substituta precisa ter vínculo ativo na mesma equipe, não pode ser a pessoa atual e não pode ter conflito de agenda. A nova escala retorna para `SCHEDULED`, exigindo a confirmação da pessoa substituta.

```json
PATCH /service-areas/schedules/:scheduleId/substitute
{
  "personId": "uuid-da-pessoa-substituta",
  "reason": "Substituição após recusa da pessoa inicialmente escalada."
}
```

A pessoa retirada recebe o alerta de transferência e a pessoa incluída recebe o alerta de nova escala.

## Remoção da escala

Somente a liderança autorizada para a equipe pode remover uma pessoa da escala. A operação exige confirmação no painel, não é aceita para escalas concluídas e rejeita automaticamente eventuais solicitações de troca que ainda estejam pendentes. A pessoa retirada recebe uma notificação interna.

A escala não é apagada fisicamente: passa ao estado interno `REMOVED`, desaparece da grade, das listagens e das verificações de conflito, mas mantém pessoa, função, data e responsável pela alteração no histórico auditável. Assim, a mesma vaga pode receber outra pessoa depois da remoção.

## Indisponibilidade para servir

Todo integrante ativo de uma equipe pode consultar a grade mensal da Área de Serviço dentro do escopo de suas próprias equipes. Na Área de Música, o participante também pode registrar que não está disponível para servir em uma data no formato `AAAA-MM-DD`. A marcação vale para a pessoa em toda a Área de Música naquela data e pode ser retirada somente pela própria pessoa.

Por privacidade, um integrante comum recebe na consulta apenas as próprias indisponibilidades. A lista consolidada de nomes fica restrita à secretaria, administração e lideranças da Área, sempre limitada ao escopo de Campus ou equipe que a pessoa pode gerenciar.

Uma indisponibilidade registrada impede novas escalas individuais ou em lote, substituições e trocas para a pessoa naquela data. A API revalida essa regra inclusive no momento em que uma solicitação de troca é aprovada. Marcações de outras organizações nunca entram na consulta ou na validação.

## Solicitação de troca pelo integrante

O integrante escalado pode solicitar uma troca antes do horário da escala. Ele não altera a escala diretamente: informa uma pessoa disponível e a solicitação fica como `PENDING` até a decisão da liderança de Louvor/equipe.

Para que a lista seja segura, cada integrante pode ter uma ou mais **funções de serviço** do catálogo da Área registradas no vínculo com a equipe, como `Guitarra`, `Baixo` ou `Ministro`. A busca de candidatos mostra somente pessoas que:

- pertencem ativamente à mesma equipe;
- possuem a mesma função da escala;
- estão ativas no cadastro;
- não possuem conflito de horário ou outra escala ativa na equipe.

```json
POST /service-areas/schedules/:scheduleId/swap-requests
{
  "replacementPersonId": "uuid-do-guitarrista-disponivel",
  "reason": "Estarei viajando neste domingo."
}
```

Ao receber a solicitação, a liderança da equipe pode aprovar ou recusar. Na aprovação, o sistema revalida o vínculo, a função e os conflitos de agenda; só então transfere a escala, registra o histórico e envia a nova confirmação para a pessoa indicada. Uma recusa preserva a escala original e notifica quem a solicitou.

## Observação geral da grade

A linha **Observações**, exibida abaixo das funções da equipe, pertence ao culto/data e ao Campus daquela coluna — não a uma pessoa escalada. A liderança autorizada pode escrever até 2000 caracteres de texto livre diretamente nessa linha. Enviar texto vazio limpa a observação. Participantes dentro do escopo da equipe podem consultar o texto, mas não alterá-lo.

O registro é independente das escalas individuais, portanto continua existindo mesmo que uma pessoa seja substituída ou removida. A API preserva a organização, Área de Serviço, Campus, data, culto relacionado e o último usuário responsável pela atualização.

```text
PATCH /service-areas/swap-requests/:requestId/approve
PATCH /service-areas/swap-requests/:requestId/reject
```

## Histórico auditável

Toda criação, resposta de status, substituição e remoção gera um item de histórico com data, usuário responsável, status anterior e novo status quando aplicável. A troca também preserva quem saiu, quem entrou e o motivo opcional.

```text
GET /service-areas/schedules/:scheduleId/history
```

A própria pessoa escalada pode consultar o histórico da sua escala atual; lideranças autorizadas da área também possuem acesso. Nenhuma alteração importante de escala apaga esse registro.

## Prevenção de conflitos

O sistema impede:

- duas escalas para a mesma pessoa, na mesma equipe e no mesmo horário;
- duas escalas ativas no mesmo horário, mesmo em equipes diferentes;
- escalas em eventos com horários sobrepostos para a mesma pessoa;
- itens conflitantes dentro do mesmo lote.

Escalas `DECLINED` não bloqueiam um novo compromisso. Escalas `SCHEDULED` e `CONFIRMED` bloqueiam conflitos. Para escalas sem evento, como o modelo atual possui apenas um horário e não um intervalo, a verificação é por coincidência exata de data e hora.

## Acesso de consulta

- Cada área de serviço possui sua própria visão consolidada de escalas. Nela, a liderança geral vê todas as equipes da área; a liderança de campus vê suas equipes do campus; a liderança de equipe vê apenas a própria equipe; e o integrante comum consulta a grade das equipes em que possui vínculo ativo, sem receber permissão de edição.
- Qualquer integrante autenticado consulta as próprias escalas em `/schedules/me`.
- Um integrante de uma equipe envolvida no evento pode consultar as escalas consolidadas daquele evento.
- Secretaria, administração e super administração também possuem a visão consolidada.
- A edição continua pertencendo à área de serviço e à sua equipe, nunca à Ordem de Culto.
