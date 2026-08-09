# Visão Geral do Banco de Dados

O banco PostgreSQL é administrado pelo Prisma. O schema e as migrations em `backend/api/prisma` são a fonte de verdade do modelo relacional.

## Fronteira organizacional

`Organization` é a fronteira de isolamento. As entidades de negócio relevantes possuem `organizationId` ou são alcançadas por relações que o preservam. As APIs recebem o contexto da organização autenticada antes de consultar ou alterar dados.

```text
Organization
├── Campus, Person e User
├── Cell, CellNetwork e CellMeeting
├── ServiceArea, ServiceTeam e ServiceMembership
├── Event, Space e Notification
├── Kids
└── WorshipOrder e WorshipRepertoire
```

## Grupos de entidades

| Grupo | Entidades principais |
| --- | --- |
| Pessoas e acesso | `Person`, `User`, `UserRoleAssignment`, `Family`, `PersonJourneyEvent` |
| Células | `Cell`, `CellMembership`, `CellLeadership`, `CellNetworkSupervision`, `CellCampusCoordination`, `CellMeeting`, `CellStudy`, `CellMultiplication` |
| Áreas de serviço | `ServiceArea`, `ServiceTeam`, `ServiceMembership`, `ServiceSchedule`, `ServiceScheduleHistory` |
| Formação | `ServiceAreaEntryStage`, `ServiceAreaApplication`, `ServiceAreaApplicationStage` |
| Eventos e cultos | `Event`, `Space`, `WorshipOrder`, `WorshipOrderTemplate`, `WorshipRepertoire` |
| Kids | `KidsClass`, `KidsEnrollment`, `KidsCheckIn`, `KidsPreCheckIn`, `KidsVisualResource` |
| Comunicação | `Notification`, `NotificationRecipient` |

## Preservação de histórico

- Vínculos de célula e de área possuem início, fim e indicador de ativo.
- Escalas registram eventos de criação, resposta e substituição em `ServiceScheduleHistory`.
- Processos de entrada em áreas preservam status, etapas concluídas, decisão e responsável.
- Eventos e Ordens de Culto preservam seus estados e relações operacionais.

## Migrations recentes

As migrations versionam cada evolução de domínio, incluindo coordenação de células por campus, modelos de Ordem de Culto, repertório, funções operacionais, histórico de escalas e entrada/formação de áreas. Após atualizar o repositório, aplique-as com:

```powershell
cd backend/api
npx prisma migrate dev
```

Em ambientes controlados de produção, utilize o procedimento de deploy de migrations definido pela infraestrutura.
