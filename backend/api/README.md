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

## Funcionalidades entregues

- Pessoas, contas, papéis, campus, famílias e jornadas.
- Células, reuniões, presença/falta, visitantes, estudos, redes e multiplicações.
- Cuidado pastoral e painel pastoral.
- Áreas de serviço, equipes, liderança, escalas e entrada/formação de voluntários.
- Eventos, espaços, agenda, IBAG Kids e recursos visuais.
- Ordem de Culto, modelos, PDF, alertas internos, repertório e fluxo de aprovação.

Consulte a [documentação central](../../docs/04-api/README.md) para os fluxos e rotas detalhados.
