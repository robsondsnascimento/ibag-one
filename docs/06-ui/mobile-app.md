# Aplicativo móvel

## Objetivo

O aplicativo IBAG One é a experiência pessoal para Android e iPhone. Ele utiliza Expo SDK 57 e complementa o painel administrativo web, sem replicar operações sensíveis de cadastro e gestão.

## Primeira versão

- Login institucional por usuário e senha.
- Sessão opcionalmente persistida no armazenamento seguro do aparelho.
- Início com resumo de escalas, eventos e estudo da célula.
- Anexo do estudo aberto de forma autenticada no Android e iPhone, sem tornar o arquivo público.
- Minha célula, com dia, horário e campus.
- Minhas escalas, incluindo confirmação ou recusa da própria participação.
- Agenda institucional com eventos aprovados dos campi vinculados à pessoa.
- Perfil, campi vinculados e encerramento de sessão.

## Isolamento e permissões

As rotas móveis usam a mesma autenticação JWT e o mesmo `organizationId` da API. Não existe parâmetro que permita ao aplicativo escolher outra organização, pessoa ou campus.

- `GET /cells/me` retorna somente vínculos ativos da pessoa autenticada, em células ativas da organização atual.
- `GET /events/me` retorna somente eventos `APPROVED` dos campi ativos vinculados à pessoa autenticada.
- As rotas de escala já restringem confirmação e recusa à própria escala.

Rotas administrativas como `GET /cells` e `GET /events` mantêm as permissões de secretaria, administração, pastoreio ou liderança já definidas no backend.

## Execução local e homologação

O app está em `apps/mobile` e utiliza Expo. A URL da API é configurada por `EXPO_PUBLIC_API_URL` em um arquivo `.env` local, usando como base `.env.example`.

Em aparelho físico, `localhost` e `127.0.0.1` representam o próprio celular. Por isso, em desenvolvimento deve-se informar o IP da máquina na mesma rede ou uma URL HTTPS de homologação. A API precisa manter CORS habilitado para esse endereço.

O aplicativo possui perfis EAS em `apps/mobile/eas.json`: `development` para desenvolvimento, `preview` para distribuição interna e `production` para as lojas. A URL da API de homologação ou produção deve ser configurada no ambiente de build, nunca gravada em código-fonte.

## Próximas evoluções sugeridas

- Registro de encontro e presença para liderança de célula.
- Solicitações de troca de escala.
- Notificações push para escalas, agenda e alertas ministeriais.
- Check-in do IBAG Kids conforme os papéis permitidos.
- Distribuição pelas lojas Google Play e App Store após a homologação.
