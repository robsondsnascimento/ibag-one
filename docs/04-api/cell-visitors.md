# Visitantes e participantes de célula

## Objetivo

O registro de visitantes começa pelo contato mais útil no encontro: nome e telefone. Os demais dados podem ser complementados quando a pessoa iniciar sua participação ativa na célula.

O telefone é normalizado antes de ser salvo e é usado para reconhecer as participações da mesma pessoa dentro da mesma célula. Isso evita que diferenças de formatação, como parênteses ou hífen, alterem a contagem.

## Fluxo

1. A pessoa autorizada abre o encontro pendente e confirma primeiro se houve visitante. Se não houve, encerra essa etapa sem preencher dados; se houve, o painel libera o registro de nome e telefone.
2. O sistema não aceita o mesmo telefone duas vezes no mesmo encontro.
3. Ao completar três participações naquela célula, a API retorna uma sugestão para incluí-la como participante ativo.
4. Confirmada a sugestão, o sistema cria ou encontra a pessoa, cria a membresia ativa na célula e registra `CELL_PARTICIPANT` na jornada.
5. Se a pessoa já estiver ativa em outra célula, a conversão solicita confirmação de transferência. A transferência encerra o vínculo anterior e cria o novo, preservando o histórico.

Ser participante ativo de célula não equivale a tornar-se membro formal da IBAG.

## Endpoints

Todos exigem JWT e garantem que o encontro pertença à organização autenticada.

- `POST /cell-meeting-visitors`: registra um visitante. Recebe `meetingId`, `nome`, `telefone`, e opcionalmente `email` e `observacao`. Retorna a quantidade de participações e `membershipSuggestion`.
- `GET /cell-meeting-visitors/meeting/:meetingId`: lista os visitantes do encontro com `visitCount` e `eligibleForMembership`.
- `PATCH /cell-meeting-visitors/:id/convert-to-person`: cria ou encontra a pessoa a partir do visitante.
- `PATCH /cell-meeting-visitors/:id/convert-to-member`: cria a membresia quando há três participações; se já existir vínculo ativo em outra célula, retorna `requiresTransfer: true`.
- `DELETE /cell-meeting-visitors/:id`: corrige um lançamento indevido e atualiza o total de visitantes do encontro.

A confirmação da transferência é feita por `POST /cell-memberships` com `confirmTransfer: true`, seguindo a regra já aplicada ao cadastro de pessoas da célula.
