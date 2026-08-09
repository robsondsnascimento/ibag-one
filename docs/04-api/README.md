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

## Células e cuidado pastoral

- [Coordenação de Células](cell-campus-coordination.md): vínculo por campus, administração de supervisão e escopo pastoral.

## Endpoints de fundação

Além dos fluxos acima, a API possui módulos para autenticação, organizações, campus, pessoas, famílias, células, redes, supervisão, estudos, cuidado pastoral, painel pastoral, eventos, espaços e notificações.

O endpoint público de saúde é `GET /health`.
