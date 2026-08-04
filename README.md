🏛️ IBAG One

<p align="center">Project Nehemiah

Uma plataforma de inteligência e cuidado pastoral para igrejas em células.

</p>---

📖 Sobre o Projeto

O IBAG One nasce com o propósito de fortalecer o cuidado pastoral, o discipulado e o crescimento saudável da igreja através da tecnologia.

Mais do que um sistema de gestão, o IBAG One será uma plataforma construída para conectar pessoas, líderes e ministérios, transformando informações em ações de cuidado.

O projeto tem como base a visão:

«"Cada casa uma extensão da igreja e cada líder uma extensão do cuidado pastoral."»

E a missão:

«"Transformar pessoas simples em verdadeiros discípulos de Jesus."»

---

🎯 Propósito

O IBAG One tem como objetivo auxiliar igrejas que trabalham com o modelo de células a:

- acompanhar a saúde das células;
- fortalecer líderes;
- melhorar o cuidado pastoral;
- acompanhar a jornada das pessoas;
- organizar ministérios;
- transformar dados em decisões.

---

🏠 O Coração do IBAG One

As células são o centro da visão da IBAG.

Por isso, a plataforma é construída tendo como principal domínio:

Pessoa
   ↓
Célula
   ↓
Liderança
   ↓
Cuidado Pastoral
   ↓
Multiplicação

O software deve servir a visão da igreja, nunca o contrário.

---

🧭 Princípios do Projeto

- 👥 Pessoas acima de cadastros.
- 🏠 Células são o coração da plataforma.
- 🙏 Tecnologia a serviço do cuidado pastoral.
- 📊 Informação deve gerar ação.
- 🧩 Simplicidade acima da complexidade.
- 🌱 Toda funcionalidade deve fortalecer o discipulado.
- 🏛️ Construir uma base sólida para muitos anos.

---

🏗️ Arquitetura

O IBAG One está sendo desenvolvido utilizando uma arquitetura modular e escalável.

Estratégia

- Monorepo;
- Organização por domínios;
- Arquitetura modular;
- Documentação antes do código;
- Evolução incremental.

---

🛠️ Stack Tecnológica

Backend

- NestJS
- TypeScript
- Node.js
- Prisma ORM

Banco de Dados

- PostgreSQL 18

Mobile

Planejado:

- Flutter

Administração

Planejado:

- Painel Web Administrativo

Versionamento

- Git
- GitHub

---

📂 Estrutura do Projeto

O IBAG One utiliza uma estrutura de monorepo:

ibag-one
│
├── apps
│   ├── mobile              # Aplicativo mobile
│   └── admin               # Painel administrativo
│
├── backend
│   └── api                 # API principal
│       ├── src
│       │   └── modules
│       │       └── health
│       │
│       └── prisma
│           ├── schema.prisma
│           └── migrations
│
├── docs                    # Documentação do projeto
│
├── packages                # Pacotes compartilhados
│
├── shared                  # Recursos compartilhados
│
├── infrastructure          # Infraestrutura e deploy
│
└── tools                   # Ferramentas auxiliares

---

🚀 Primeiras Entregas

Backend API

✅ Projeto NestJS criado

O backend inicial foi criado utilizando NestJS seguindo uma arquitetura modular.

---

✅ Primeiro módulo implementado

Health Module

Responsável por verificar a saúde da aplicação.

Estrutura:

health
├── health.controller.ts
├── health.module.ts
└── health.service.ts

---

✅ Primeiro Endpoint Funcional

GET /health

Resposta:

{
  "status": "ok",
  "service": "IBAG One API",
  "codename": "Project Nehemiah",
  "version": "0.1.0"
}

---

🗄️ Banco de Dados

✅ PostgreSQL configurado

O banco principal do projeto foi criado utilizando PostgreSQL 18.

Banco:

ibag_one

---

✅ Prisma ORM configurado

O Prisma foi integrado ao backend para gerenciamento do banco de dados.

Implementado:

- conexão PostgreSQL;
- schema Prisma;
- sistema de migrations;
- versionamento das alterações do banco.

---

🏛️ Primeiro Modelo de Domínio

✅ Campus

O primeiro domínio criado representa as unidades da igreja dentro da estrutura multicampus.

O conceito de Campus permite que o IBAG One acompanhe diferentes localidades mantendo uma visão única da igreja.

Responsável por:

- identificação do Campus;
- localização;
- status;
- histórico organizacional.

Modelo inicial:

model Campus {
  id        String   @id @default(uuid())
  nome      String
  cidade    String
  estado    String
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

Migration criada:

create_campus

---

🧩 Domínios Planejados

A plataforma será construída através dos principais domínios da igreja.

---

👥 Pessoas

O principal elemento do sistema.

Responsável por:

- cadastro;
- histórico;
- jornada na igreja;
- relacionamento;
- participação em células;
- ministérios;
- mudanças de Campus.

---

🏠 Células

O principal domínio da IBAG.

Contemplará:

- Campus;
- Redes;
- Supervisores;
- Líderes;
- Líderes em treinamento (LT);
- Anfitriões;
- Multiplicações;
- Encontros;
- Visitantes;
- Saúde da célula.

---

⛪ Campus

Gestão das diferentes localidades da igreja.

Inclui:

- membros;
- líderes;
- ministérios;
- células;
- histórico da pessoa.

---

🎵 Ministérios

Gestão das áreas de serviço.

Exemplos:

- Louvor;
- Recepção;
- Dança;
- Comunicação;
- Mídia;
- Outros ministérios.

Uma pessoa poderá servir em múltiplos ministérios.

---

📅 Eventos

Gestão de:

- agenda;
- solicitações;
- disponibilidade;
- registros;
- histórico.

---

📊 Dashboard Pastoral

Visão estratégica para liderança.

Possíveis indicadores:

- saúde das células;
- crescimento;
- visitantes;
- líderes ativos;
- multiplicações;
- acompanhamento pastoral.

---

📍 Status do Projeto

🚧 Em desenvolvimento

Fases

✅ Descoberta do Domínio (Domain Discovery)

✅ Documentação da visão do produto

✅ Fundação da arquitetura

✅ Primeiro Backend funcional

✅ Banco de dados configurado

✅ Prisma ORM configurado

✅ Primeiro modelo de domínio criado (Campus)

⌛ Modelagem de Domínio (DDD)

⌛ Autenticação

⌛ Módulo de Pessoas

⌛ Módulo de Células

⌛ Aplicativo Mobile

⌛ Dashboard Pastoral

---

🗺️ Roadmap Inicial

Fase 1 - Fundação

✅ Repositório criado

✅ Documentação inicial

✅ Backend configurado

✅ Health Module

✅ PostgreSQL configurado

✅ Prisma configurado

✅ Modelo Campus criado

Fase 2 - Pessoas

Planejado:

- cadastro;
- identidade;
- histórico;
- relacionamento.

Fase 3 - Células

Planejado:

- estrutura de redes;
- acompanhamento;
- registros;
- indicadores.

Fase 4 - Plataforma Completa

Planejado:

- Mobile;
- Administração;
- Dashboards;
- Inteligência pastoral.

---

🏛️ Project Nehemiah

O nome representa a visão de reconstrução.

Assim como Neemias liderou a reconstrução dos muros de Jerusalém, o Project Nehemiah busca construir uma base tecnológica sólida para fortalecer o cuidado, a liderança e a missão da igreja.

---

📜 Histórico Inicial

Primeiros marcos:

7d28bd8
Inicialização do repositório

↓

Documentação da visão

↓

Arquitetura inicial

↓

Contexto do sistema IBAG One

↓

Primeira API Backend criada

↓

Health Module implementado

↓

Prisma ORM configurado

↓

PostgreSQL conectado

↓

Banco IBAG One criado

↓

Primeiro modelo de domínio criado:
Campus

↓

Primeira migration aplicada

---

🤝 Desenvolvimento

Este projeto é construído com foco em:

- qualidade;
- simplicidade;
- escalabilidade;
- manutenção de longo prazo.

Cada decisão técnica deve responder:

«"Isso ajuda a igreja a cuidar melhor das pessoas?"»

---

💙 Nosso Norte

«"Toda linha de código escrita neste projeto deve facilitar o cuidado com pessoas, fortalecer líderes e apoiar a missão da igreja."»
