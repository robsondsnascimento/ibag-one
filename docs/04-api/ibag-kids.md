# IBAG Kids — API operacional

## Cadastro e organização

- `POST /kids/children`: cadastra criança e perfil de cuidado protegido.
- `POST /kids/classes`: cria turma/faixa, vinculada à Área Kids, equipe e campus.
- `POST /kids/classes/:id/enrollments`: matricula criança na turma.
- `POST /kids/children/:id/authorized-pickups`: registra pessoa autorizada para retirada.

## Recepção e QR

- `POST /kids/check-ins`: check-in manual.
- `POST /kids/check-ins/scan`: check-in pela leitura do QR da criança.
- `POST /kids/check-outs/scan`: retirada por QR e etiqueta temporária.
- `POST /kids/pre-check-ins`: pré-check-in do responsável autorizado.
- `POST /kids/pre-check-ins/:id/confirm`: confirmação presencial pela equipe de Check-in.
- `PATCH /kids/pre-check-ins/:id/cancel`: cancelamento pelo responsável.
- `GET /kids/worship-events/:id/pre-check-ins`: fila de pré-check-ins pendentes.
- `POST /kids/worship-events/:id/pre-check-ins/expire`: expira pendências após o culto.

Estados do pré-check-in: `PENDING`, `CONFIRMED`, `EXPIRED` e `CANCELLED`. O pré-check-in não representa presença até a confirmação presencial.

## Acesso e operação

- `POST /kids/operational-roles`: atribui Check-in, Segurança ou Líder de Culto.
- `PATCH /kids/operational-roles/:id/end`: encerra a função.
- `POST /kids/operational-roles/:id/transfer`: transfere a função com histórico.
- `GET /kids/worship-events/:id/overview`: visão operacional do Líder de Culto escalado.

Check-in e check-out são exclusivos da função `CHECK_IN`, liderança Kids e perfis administrativos. A função `SECURITY` não opera retirada; ela é reservada à visão operacional do culto.

## Recursos visuais

- `POST /kids-resources`: cadastra recurso visual.
- `POST /kids-resources/requests`: cria solicitação para culto.
- `PATCH /kids-resources/requests/:id/:status`: registra pronto, entregue, devolvido ou cancelado.
- `POST /kids-resources/requests/:id/remind`: Líder de Culto alerta o servo sobre devolução pendente.

O Líder de Culto apenas acompanha pendências e envia lembretes; solicitações não exigem aprovação da liderança.

## Segurança

- Check-in e check-out: exclusivamente equipe Check-in, liderança Kids e administração.
- Dados de cuidado: liderança Kids completa, secretaria, administração e pastoral.
- Servos e líderes de faixa: acesso apenas à própria turma/equipe.
- Etiqueta de retirada: obrigatória e válida somente no check-in aberto correspondente.

## Testes automatizados

Os testes unitários cobrem QR inexistente, retirada sem check-in, pré-check-in duplicado, cancelamento, expiração, isolamento por faixa, dados sensíveis, visão do Líder de Culto e lembrete de recursos.
