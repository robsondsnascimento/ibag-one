# IBAG One API

API NestJS do IBAG One. Centraliza os domínios de pessoas, células, áreas de serviço, eventos, IBAG Kids, Ordem de Culto e repertório.

## Tecnologias

- NestJS e TypeScript
- PostgreSQL
- Prisma ORM
- JWT e Passport
- Jest
- PDFKit para exportação de Ordens de Culto

## Configuração local

Crie `backend/api/.env` com a conexão local do PostgreSQL. Não inclua credenciais reais em commits.

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/ibag_one?schema=public"
PORT=3000
```

Depois execute:

```powershell
npm install
npx prisma migrate dev
npm run start:dev
```

## Comandos úteis

```powershell
# Compilar
npm run build

# Executar todos os testes unitários
npx jest --runInBand

# Executar o teste integrado de infraestrutura da API
npm run test:e2e

# Executar os testes de integração com PostgreSQL isolado
# Exige IBAG_TEST_DATABASE_URL apontando exclusivamente para ibag_one_test
npm run test:integration

# Gerar cliente Prisma após mudanças de schema
npx prisma generate

# Criar e aplicar uma migração local
npx prisma migrate dev --name nome_da_migracao
```

## Princípios da API

- JWT obrigatório nas rotas de negócio.
- Contexto organizacional obrigatório: toda consulta e alteração respeita `organizationId`.
- Funções globais coexistem com escopos por campus, área, equipe, célula e rede.
- Histórico é preservado para alterações operacionais importantes, como escalas.
- Escalas, eventos e Ordem de Culto possuem responsabilidades independentes.

## Operação da API

- Documentação OpenAPI: `GET /docs` e `GET /docs-json`.
- Saúde: `GET /health`, `GET /health/live` e `GET /health/ready`.
- Proteção: Helmet, CORS configurável, limite de 100 requisições por minuto e erros padronizados.
- Auditoria: alterações autenticadas bem-sucedidas ficam registradas em `AuditLog`, sem gravar credenciais ou corpos de requisição.
- Paginação: `GET /persons` e `GET /cells` aceitam `page` e `limit` (até 100) e retornam `data` e `meta`.

Consulte [operação e homologação](../../docs/04-api/operation-and-homologation.md), [notificações externas](../../docs/04-api/external-notifications.md) e [agenda institucional](../../docs/04-api/google-calendar-agenda.md) para a configuração detalhada.

## Testes de integração com banco

Os testes de integração exercitam serviços reais contra um PostgreSQL separado. Eles exigem a variável `IBAG_TEST_DATABASE_URL`, cujo banco deve se chamar exatamente `ibag_one_test`; a rotina recusa qualquer outro nome para evitar tocar na base local de desenvolvimento.

Após criar esse banco e aplicar as migrações, execute no PowerShell:

```powershell
$env:IBAG_TEST_DATABASE_URL = "postgresql://USUARIO:SENHA@localhost:5432/ibag_one_test?schema=public"
$env:DATABASE_URL = $env:IBAG_TEST_DATABASE_URL
npx prisma migrate deploy
npm run test:integration
```

Não versionar essa URL nem suas credenciais.

## Funcionalidades entregues

- Pessoas, contas, papéis, campus, famílias e jornadas.
- Células, reuniões, presença/falta, visitantes, estudos, redes e multiplicações.
- Cuidado pastoral e painel pastoral.
- Áreas de serviço, equipes, liderança, escalas e entrada/formação de voluntários.
- Eventos, espaços, agenda, IBAG Kids e recursos visuais.
- Ordem de Culto, modelos, PDF, alertas internos, repertório e fluxo de aprovação.

Consulte a [documentação central](../../docs/04-api/README.md) para os fluxos e rotas detalhados.
