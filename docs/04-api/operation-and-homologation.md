# Operação, segurança e homologação

## Endpoints operacionais

- `GET /health` e `GET /health/live`: confirmam que a API está em execução.
- `GET /health/ready`: confirma também a conectividade com o PostgreSQL; retorna `503` quando o banco não responde.
- `GET /docs`: interface navegável do contrato OpenAPI.
- `GET /docs-json`: contrato OpenAPI em JSON para clientes e ferramentas.

Em produção, a documentação pode ser desativada com `ENABLE_SWAGGER=false`.

## Proteções aplicadas

- JWT obrigatório nas rotas de negócio.
- Validação global: campos não previstos e contratos inválidos retornam `400`.
- Respostas de erro têm `statusCode`, `error`, `message`, `path` e `timestamp`.
- Cabeçalhos de segurança via Helmet.
- CORS configurável por `CORS_ORIGINS`; em produção ele deve ser informado.
- Limite padrão de 100 requisições por minuto por origem.
- Encerramento controlado do Prisma ao desligar a aplicação.

O limite de requisições é local ao processo. Antes de executar múltiplas instâncias da API, a Igreja deve definir um armazenamento compartilhado (por exemplo, Redis) para esse controle.

## Configuração

Use `backend/api/.env.example` como referência. `JWT_SECRET` é obrigatório e precisa ter ao menos 32 caracteres. Nunca versionar o arquivo `.env` nem tokens de integração.

## Paginação

As listagens de pessoas e células aceitam `page` e `limit` (máximo 100), por exemplo: `GET /persons?page=2&limit=20`.

O retorno usa a forma:

```json
{
  "data": [],
  "meta": { "page": 2, "limit": 20, "total": 53, "totalPages": 3 }
}
```

## Auditoria

Alterações autenticadas bem-sucedidas (`POST`, `PUT`, `PATCH` e `DELETE`) registram usuário, organização, rota, identificador retornado, status e horário em `AuditLog`.

O registro não armazena senha, token ou corpo da requisição. Falhas para gravar auditoria são registradas no log técnico sem interromper o atendimento ministerial.

## Checklist de homologação

Antes de liberar o frontend ou produção, validar com dados controlados:

1. Login, expiração de token e acesso negado sem JWT.
2. Dois campus da mesma organização: `PASTOR` limitado ao seu campus e `PASTOR_SENIOR` com acesso organizacional.
3. Coordenação, supervisão, liderança e multiplicação de células.
4. Registro de reunião, presença, falta, visitante e liberação semanal do estudo.
5. Cuidado e painel pastoral nos escopos corretos.
6. Cadastro, escala e entrada de voluntários nas áreas de serviço.
7. Eventos, Ordem de Culto, repertório, PDF e alerta aos participantes.
8. IBAG Kids: turmas, autorização de retirada, QR, check-in/out, recursos e visão de Líder de Culto.
9. Notificação interna e, quando configurados, webhooks de WhatsApp e ProPresenter em ambiente de homologção.
10. `GET /health/ready`, `GET /docs`, migrações e backup/restauração do PostgreSQL.

### Fluxos do painel a validar

Antes da homologação com dados reais, a secretaria deve disponibilizar a estrutura aprovada de organização, campi, áreas de serviço, equipes, lideranças e eventos. O sistema não cria essa estrutura por suposição.

Com esses dados cadastrados, validar também:

1. uma pessoa escalada confirma e recusa a própria escala em **Minhas escalas**;
2. a liderança visualiza pendências e recusas da área dentro do seu escopo;
3. uma escala vinculada a evento aparece na consulta da Agenda, sem ações de edição;
4. uma recusa, substituição ou nova escala aparece na central de notificações do destinatário;
5. a criação em lote falha integralmente quando uma das pessoas possui conflito de agenda.
6. um evento pode vincular célula, áreas, equipes e espaços compatíveis com seu campus; a solicitação é aprovada ou cancelada apenas por quem a API autoriza;
7. o checklist do evento mantém os itens concluídos e a Agenda apresenta as escalas apenas para consulta.

## Verificação automática

```powershell
cd backend/api
npm run build
npx jest --runInBand
npm run test:e2e

$env:IBAG_TEST_DATABASE_URL = "postgresql://USUARIO:SENHA@localhost:5432/ibag_one_test?schema=public"
$env:DATABASE_URL = $env:IBAG_TEST_DATABASE_URL
npx prisma migrate deploy
npm run test:integration
```

O banco de integração precisa se chamar exatamente `ibag_one_test`; a rotina de teste se recusa a executar em qualquer outro banco.
As URLs de WhatsApp e ProPresenter são deliberadamente desligadas durante os testes automatizados.
