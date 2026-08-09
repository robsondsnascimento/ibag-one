# IBAG One

Plataforma de cuidado pastoral, células, áreas de serviço, eventos e operação da Igreja Batista Ágape (IBAG). O projeto prioriza pessoas, jornadas e contexto de organização antes de cadastros isolados.

## Estado atual

O backend NestJS está funcional, multi-tenant por `organizationId`, protegido por autenticação JWT e persistido em PostgreSQL com Prisma. A suíte atual possui **23 suítes e 71 testes unitários**.

| Domínio | Entregas atuais |
| --- | --- |
| Pessoas e acesso | Pessoas, contas, papéis adicionais, super administração, campus, famílias e jornada da pessoa. |
| Células | Redes, supervisão, liderança, apoio, presença/falta, visitantes, conclusão de reunião, estudos semanais, localização e multiplicação. |
| Cuidado pastoral | Registros de acompanhamento e visão pastoral consolidada. |
| Áreas de serviço | Áreas globais ou por campus, equipes, membros, lideranças, funções operacionais e escalas. |
| Entrada em áreas | Interesse, etapas configuráveis, comprovação, aprovação, recusa, desistência e criação do vínculo de integrante. |
| Eventos | Solicitação, aprovação, agenda, espaços, áreas e equipes envolvidas. |
| Ordem de culto | Modelo editável, itens, materiais, demandas, alertas internos e geração de PDF. |
| Louvor | Repertório, músicas, aprovação da liderança, prazo de envio e encaminhamento à Ordem de Culto. |
| IBAG Kids | Estrutura de liderança, faixas etárias, check-in/out, QR de retirada, pré-check-in, recursos visuais e escalas operacionais. |
| Comunicação | Registros internos de notificação, prontos para futura entrega por WhatsApp e ProPresenter. |

## Regras centrais já aplicadas

- Todo dado de negócio é isolado pela organização atual.
- Uma pessoa pode servir em várias áreas, mas conflitos de escala ativos são impedidos.
- Escalas pertencem à área/equipe; eventos e Ordem de Culto apenas as consultam.
- Uma pessoa só se torna integrante após aprovação no processo da área.
- A Ordem de Culto é independente da escala e pode ser montada a partir de modelos editáveis.
- O repertório é enviado pelo Ministro de Louvor, aprovado pela liderança e entregue à equipe de Ordem de Culto.
- A presença em células permite registrar ausência; visitantes podem ser sugeridos como membros após três encontros.
- Estudos semanais são globais à organização e dependem do registro da célula anterior, com exceção prevista para células novas.

## Estrutura

```text
ibag-one/
├── backend/api/       API NestJS, Prisma e testes
├── docs/              Produto, domínio, arquitetura, API e banco
├── apps/              Reservado para os futuros aplicativos
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

A API inicia, por padrão, em `http://localhost:3000`. O endpoint de saúde é `GET /health`.

## Verificações

```powershell
cd backend/api
npx nest build
npx jest --runInBand
```

## Documentação

- [Visão e roadmap](docs/01-product/roadmap.md)
- [Mapa de domínios](docs/02-domain/domain-map.md)
- [Arquitetura e módulos](docs/03-architecture/modules.md)
- [Integrações](docs/03-architecture/integrations.md)
- [Referência da API](docs/04-api/README.md)
- [Visão do banco](docs/05-database/database-overview.md)

## Próximos passos

O núcleo de negócio está pronto para o início do frontend. Antes de produção, as prioridades são configurar dados reais da IBAG, executar testes integrados/homologação e conectar os provedores autorizados de WhatsApp e ProPresenter.
