# Agenda institucional e Google Calendar

## Decisão funcional

O IBAG One utiliza **um único calendário institucional compartilhado** para a organização. Os eventos são criados, aprovados, alterados e cancelados somente no IBAG One; o Google Calendar recebe uma cópia de leitura. Assim, o histórico, as aprovações e as permissões continuam centralizados na aplicação.

## Quem pode usar a agenda no IBAG One

- Secretaria, administração, super administração e equipe pastoral podem consultar a agenda conforme o escopo já definido para sua função.
- Líderes ativos de área, campus ou equipe podem consultar todos os eventos do calendário compartilhado e solicitar ou operar eventos ligados a sua área/equipe.
- Líderes ativos de célula podem consultar todos os eventos e solicitar ou operar eventos ligados à célula que lideram.
- Um membro sem uma liderança ativa não acessa a agenda.

Lideranças não podem criar nem alterar um evento para uma área, equipe ou célula fora de sua responsabilidade. Eventos administrativos e pastorais podem ser aprovados automaticamente conforme as regras já existentes; solicitações de lideranças seguem como `REQUESTED` até a aprovação.

## Eventos recorrentes

Na criação, a pessoa responsável informa se o evento se repete **uma vez por semana** ou **uma vez por mês** e define a data final da série. A API cria uma ocorrência real para cada data, com o mesmo escopo, espaços, áreas, status e histórico inicial. Dessa forma, cada encontro pode ter aprovação, checklist, cancelamento, sincronização e escalas próprios. Para uma série de Cultos já aprovada, a API também cria uma Ordem de Culto independente para cada ocorrência quando houver modelo padrão ativo e todas as Áreas de Serviço exigidas pelo modelo já estiverem vinculadas ao evento; sem essa compatibilidade, a ocorrência continua disponível para receber uma ordem manualmente.

Todos os conflitos de campus e espaços são validados antes da série ser gravada. Se uma ocorrência for inválida, a série inteira não é criada. Recorrências mensais iniciadas nos dias 29, 30 ou 31 usam o último dia disponível em meses menores e voltam ao dia original quando ele existir novamente. A edição altera apenas uma ocorrência; para mudar a periodicidade, cria-se uma nova série.

## Sincronização

Quando a integração estiver configurada:

1. Um evento aprovado é enviado ao Google Calendar.
2. Alterações em um evento aprovado atualizam o mesmo evento no Google.
3. O cancelamento remove o evento do Google e preserva o histórico no IBAG One.
4. Eventos ainda solicitados não são publicados no Google.
5. A rota de sincronização manual permite repetir uma tentativa autorizada.

Cada ocorrência recorrente aprovada é sincronizada como um evento próprio, preservando sua operação individual no IBAG One.

Cada evento guarda o identificador remoto e o status da sincronização (`SYNCED`, `FAILED` ou `CANCELLED`). Se o Google estiver indisponível, o evento do IBAG One continua válido e a falha fica registrada para nova tentativa.

## Configuração institucional

No projeto do Google Cloud da IBAG:

1. Habilite a Google Calendar API.
2. Crie uma credencial OAuth 2.0 para a conta institucional que possui permissão de edição no calendário compartilhado.
3. Autorize o escopo `https://www.googleapis.com/auth/calendar` e obtenha o *refresh token* dessa conta por um fluxo OAuth seguro.
4. Configure as variáveis abaixo no ambiente da API, nunca no repositório:

```env
GOOGLE_CALENDAR_ID="id-do-calendario-institucional"
GOOGLE_CALENDAR_CLIENT_ID="..."
GOOGLE_CALENDAR_CLIENT_SECRET="..."
GOOGLE_CALENDAR_REFRESH_TOKEN="..."
GOOGLE_CALENDAR_TIME_ZONE="America/Sao_Paulo"
```

Sem todas essas variáveis, a integração fica deliberadamente desligada e a API responde `configured: false` no status da agenda. O `GOOGLE_CALENDAR_ID` deve apontar para um único calendário institucional; ele não deve variar por campus, área ou célula.

O compartilhamento do calendário no Google deve ser configurado pela administração da conta institucional. A API não altera ACLs do Google Calendar nem distribui credenciais a usuários.

## Acesso móvel aos eventos

Integrantes sem uma liderança ativa não acessam a agenda administrativa compartilhada, mas podem consultar no aplicativo os eventos institucionais já aprovados de seus campi vinculados. A rota móvel não expõe eventos solicitados, cancelados, responsáveis, checklist, espaços ou histórico.

- `GET /events/me`: agenda pessoal móvel, limitada aos eventos `APPROVED` dos campi ativos da pessoa autenticada.

## Rotas relevantes

- `GET /events`: agenda compartilhada, disponível apenas para lideranças autorizadas.
- `GET /events/me`: visão institucional pessoal para o aplicativo móvel.
- `POST /events`: cria uma solicitação ou evento aprovado, segundo o perfil de quem cria.
- `PATCH /events/:id`: atualiza o evento dentro do escopo de quem opera.
- `POST /events/:id/google-calendar/sync`: repete a sincronização para quem pode operar o evento.
- `GET /events/google-calendar/status`: informa se a configuração institucional está ativa.

As rotas usam JWT e sempre respeitam o `organizationId` da sessão autenticada.
