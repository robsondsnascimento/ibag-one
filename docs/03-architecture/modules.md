# Módulos do Backend

A API NestJS está organizada por domínios. Cada módulo expõe controller, serviço, DTOs e regras próprias, compartilhando o contexto da organização e o Prisma.

## Fundação

- `auth`, `user`, `organization`, `campus`, `person`, `family`, `health`.
- Contexto organizacional, JWT, papéis e permissões.

## Células e cuidado

- `cell`, `cell-membership`, `cell-leadership`, `cell-support-role`.
- `cell-network`, `cell-network-supervision`, `cell-meeting`, `cell-meeting-attendance`, `cell-meeting-visitor`.
- `cell-study`, `cell-location`, `cell-multiplication`, `pastoral-care`, `pastoral-dashboard`, `person-journey`.

## Áreas de serviço

- `service-area`: áreas, equipes, vínculos, funções operacionais e escalas.
- `service-area-onboarding`: interesse, etapas de formação, aprovação, recusa e desistência.

## Eventos e operação

- `space`, `event`, `notification`.
- `kids` e `kids-resource`.
- `worship-order`, `worship-order-template` e `worship-repertoire`.

## Convenções

- Controllers usam `JwtAuthGuard` nas rotas de negócio.
- Serviços recebem `OrganizationContext` e aplicam `organizationId` às consultas.
- DTOs validam entrada com `class-validator`.
- Prisma e suas migrations são a fonte de verdade do modelo relacional.
- Alterações com valor histórico criam registros ou encerram vínculos, em vez de removê-los.
