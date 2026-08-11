# IBAG One

Plataforma de cuidado pastoral, células, áreas de serviço, eventos e operação da Igreja Batista Ágape (IBAG). O projeto prioriza pessoas, jornadas e contexto de organização antes de cadastros isolados.

## Estado atual

O backend NestJS está funcional, multi-tenant por `organizationId`, protegido por autenticação JWT e persistido em PostgreSQL com Prisma. O painel administrativo React já possui login institucional integrado à API, sessão persistente opcional e identificação dinâmica de organização, campus e função. A suíte atual possui **34 suítes e 129 testes unitários**, além de testes HTTP e de integração com PostgreSQL isolado.

A agenda institucional possui sincronização unidirecional opcional com um único Google Calendar compartilhado. O IBAG One permanece como fonte de verdade para solicitações, aprovações, alterações e cancelamentos.

| Domínio | Entregas atuais |
| --- | --- |
| Pessoas e acesso | Pessoas, campus principal e vínculos adicionais por campus, contas, papéis adicionais, super administração, famílias e jornada da pessoa. |
| Células | Coordenação por campus, redes, supervisão, liderança, apoio, presença/falta, visitantes, conclusão de reunião, estudos semanais, localização e multiplicação. |
| Cuidado pastoral | Registros de acompanhamento e visão pastoral consolidada com escopo de campus. |
| Áreas de serviço | Áreas globais ou por campus, equipes, membros, lideranças, funções operacionais, escalas e solicitações de troca por função. |
| Entrada em áreas | Interesse, etapas configuráveis, comprovação, aprovação, recusa, desistência e criação do vínculo de integrante. |
| Eventos | Solicitação, aprovação, agenda, espaços, áreas e equipes envolvidas. |
| Ordem de culto | Modelo editável, itens, materiais, demandas automáticas por área, alertas internos e geração de PDF. |
| Louvor | Repertório, músicas, aprovação da liderança, prazo de envio, links do YouTube e encaminhamento ao modelo de músicas da Ordem de Culto. |
| IBAG Kids | Estrutura de liderança, faixas etárias, check-in/out, QR de retirada, pré-check-in, recursos visuais e escalas operacionais. |
| Comunicação | Notificações internas, adaptadores opcionais de webhook para WhatsApp e ProPresenter e alertas de Ordem de Culto. |
| Operação | Swagger/OpenAPI, health checks, auditoria de alterações, CORS, limite de requisições e paginação inicial. |

## Regras centrais já aplicadas

- Todo dado de negócio é isolado pela organização atual.
- Uma pessoa pode servir em várias áreas, mas conflitos de escala ativos são impedidos.
- A pessoa escalada pode solicitar troca somente para alguém da mesma equipe, com a mesma função de serviço e sem conflito; a liderança da equipe aprova ou recusa antes de efetivar a substituição.
- Escalas pertencem à área/equipe; eventos e Ordem de Culto apenas as consultam.
- Uma pessoa só se torna integrante após aprovação no processo da área.
- A Ordem de Culto é independente da escala e pode ser montada a partir de modelos editáveis.
- A inclusão de um item da Ordem de Culto com Área de Serviço cria uma demanda e encaminha o aviso à liderança responsável; alterações de área e remoções também são comunicadas.
- O repertório é enviado pelo Ministro de Louvor, aprovado pela liderança e entregue à equipe de Ordem de Culto.
- O modelo Cachoeirinha organiza músicas em cinco momentos e permite distribuir o repertório aprovado automaticamente para cada posição correspondente.
- A presença em células permite registrar ausência; visitantes são identificados pelo telefone e, após três encontros na mesma célula, podem ser incluídos como participantes ativos sem se tornarem membros formais automaticamente.
- Estudos semanais são globais à organização e dependem do registro da célula anterior, com exceção prevista para células novas.
- A coordenação de células é um vínculo por campus; no cuidado pastoral, atua abaixo do pastor e acima da supervisão de rede.
- Uma pessoa pode manter um único cadastro e login, com um campus principal e vínculos ativos em um ou mais campi da organização.
- `PASTOR` possui escopo dos campi ativos vinculados à sua pessoa; `PASTOR_SENIOR` herda as responsabilidades pastorais em todos os campi da organização.

## Estrutura

```text
ibag-one/
├── backend/api/       API NestJS, Prisma e testes
├── docs/              Produto, domínio, arquitetura, API e banco
├── apps/admin/        Painel administrativo React/Vite
├── packages/          Reservado para pacotes compartilhados
└── infrastructure/    Reservado para deploy e integrações
```

## Executar a API localmente

Requisitos: Node.js, npm e PostgreSQL. Configure `DATABASE_URL` em `backend/api/.env` sem versionar credenciais.

```powershell
cd backend/api
npm install
npx prisma migrate dev
npm run start:dev
```

A API inicia, por padrão, em `http://localhost:3000`. A documentação está em `GET /docs`; os endpoints de saúde são `GET /health`, `GET /health/live` e `GET /health/ready`.

## Executar o painel administrativo localmente

Com a API em execução, abra outro terminal:

```powershell
cd apps/admin
npm install
npm run dev
```

O painel abre em `http://127.0.0.1:5173` e usa a API em `http://127.0.0.1:3000` por padrão. Para apontar para outro ambiente, copie `apps/admin/.env.example` para `apps/admin/.env.local` e ajuste `VITE_API_URL`. Nenhuma senha é armazenada pelo painel; apenas o token de sessão retornado pela API.

No acesso da IBAG, informe apenas o usuário (por exemplo, `superadmin`); o domínio `@ibag.one` é completado automaticamente. Endereços de e-mail completos continuam aceitos para manter compatibilidade com contas já existentes.

## Verificações

```powershell
cd backend/api
npx nest build
npx jest --runInBand
npm run test:e2e
npm run test:integration
```

## Documentação

- [Visão e roadmap](docs/01-product/roadmap.md)
- [Mapa de domínios](docs/02-domain/domain-map.md)
- [Arquitetura e módulos](docs/03-architecture/modules.md)
- [Integrações](docs/03-architecture/integrations.md)
- [Referência da API](docs/04-api/README.md)
- [Operação e homologação](docs/04-api/operation-and-homologation.md)
- [Notificações externas](docs/04-api/external-notifications.md)
- [Agenda institucional e Google Calendar](docs/04-api/google-calendar-agenda.md)
- [Painel administrativo](docs/06-ui/administrative-panel.md)
- [Visão do banco](docs/05-database/database-overview.md)

## Próximos passos

O núcleo de negócio está pronto para o início do frontend. Antes de produção, a validação ministerial do checklist, a configuração de dados reais, backup/restauração e a ativação dos conectores autorizados continuam necessárias.
