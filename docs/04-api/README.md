# Referência da API

Esta pasta descreve os fluxos de negócio expostos pela API do IBAG One. Todas as rotas de negócio usam JWT e respeitam a organização presente no contexto autenticado.

## Áreas de serviço e formação

- [Funções operacionais](service-operational-roles.md): papéis extras dentro de equipes, como Ministro de Louvor.
- [Escalas de serviço](service-schedules.md): criação em lote, confirmação, recusa, substituição, conflitos e histórico.
- [Entrada e formação](service-area-onboarding.md): interesse, etapas por área, aprovação e criação de integrante.

## Cultos e eventos

- [Ordem de Culto](worship-order.md): criação, itens, materiais, demandas e publicação.
- [Modelos de Ordem de Culto](worship-order-templates.md): estruturas reutilizáveis e editáveis.
- [Alertas e PDF](worship-order-alerts-and-pdf.md): comunicação aos participantes e exportação.
- [Repertório](worship-repertoire.md): envio pelo Ministro de Louvor, aprovação e entrega à Ordem de Culto.

## IBAG Kids e acesso

- [IBAG Kids](ibag-kids.md): turmas, responsáveis, check-in/out, QR, recursos e operações.
- [Papéis de usuário](user-roles.md): papéis globais e atribuições adicionais.

## Operação e integrações

- [Operação, segurança e homologação](operation-and-homologation.md): health checks, Swagger, CORS, auditoria, paginação e checklist final.
- [WhatsApp e ProPresenter](external-notifications.md): adaptadores externos opcionais e contrato de webhook.
- [Agenda institucional e Google Calendar](google-calendar-agenda.md): calendário único, escopo das lideranças e sincronização unidirecional.

## Células e cuidado pastoral

- [Coordenação de Células](cell-campus-coordination.md): vínculo por campus, administração de supervisão e escopo pastoral.
- [Redes e supervisão de células](cell-networks.md): criação de redes, vínculo de células e supervisão por rede.
- [Estudos semanais de célula](cell-studies.md): publicação institucional, acesso condicionado ao encontro anterior e download do anexo.
- [Visitantes e participantes de célula](cell-visitors.md): registro por telefone, sugestão após três encontros e transferência confirmada.

## Endpoints de fundação

Além dos fluxos acima, a API possui módulos para autenticação, organizações, campus, pessoas, famílias, células, redes, supervisão, estudos, cuidado pastoral, painel pastoral, eventos, espaços e notificações.

Os endpoints públicos de saúde são `GET /health`, `GET /health/live` e `GET /health/ready`.
