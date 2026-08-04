# 🏛️ IBAG One

> **Project Nehemiah**
> Uma plataforma de inteligência e cuidado pastoral para igrejas em células.

---

## 📖 Sobre o Projeto

O IBAG One nasce com o propósito de fortalecer o cuidado pastoral, o discipulado e o crescimento saudável da igreja através da tecnologia.

Mais do que um sistema de gestão, o IBAG One será uma plataforma construída para apoiar líderes, pastores e membros, colocando pessoas acima de cadastros e relacionamentos acima de processos.

O projeto tem como base a visão:

> **"Cada casa uma extensão da igreja e cada líder uma extensão do cuidado pastoral."**

E a missão:

> **"Transformar pessoas simples em verdadeiros discípulos de Jesus."**

---

# 🎯 Propósito

O IBAG One busca transformar informações em ações de cuidado.

A plataforma permitirá que líderes tenham uma visão clara sobre:

- Saúde das células;
- Desenvolvimento de líderes;
- Acompanhamento de pessoas;
- Eventos;
- Ministérios;
- Crescimento da igreja.

---

# 🏠 O Coração da Plataforma

As células são o centro da visão da IBAG.

Por isso, o IBAG One será construído tendo como principal domínio:

Pessoas
   ↓
Células
   ↓
Liderança
   ↓
Cuidado Pastoral
   ↓
Multiplicação

A tecnologia deve servir a visão da igreja, e não o contrário.

---

# 🧭 Princípios do Projeto

- 👥 Pessoas acima de cadastros.
- 🏠 As células são o coração da plataforma.
- 🙏 O software deve fortalecer o cuidado pastoral.
- 📊 Informação deve gerar ação.
- 🧩 Simplicidade acima da complexidade.
- 🌱 Toda funcionalidade deve contribuir para o discipulado.

---

# 🏗️ Arquitetura do Sistema

O IBAG One está sendo desenvolvido seguindo princípios de arquitetura escalável e modular.

## Estratégia

- Monorepo
- Organização por domínios
- Arquitetura modular
- Evolução incremental
- Documentação antes do código

---

# 🛠️ Stack Atual

## Backend

- NestJS
- TypeScript
- Node.js

## Controle de versão

- Git
- GitHub

## Futuras aplicações

- Aplicativo Mobile
- Painel Administrativo
- Dashboard Pastoral

---

# 🚀 Primeiras Entregas

## Backend API

✅ Projeto NestJS criado

✅ Estrutura modular implementada

✅ Primeiro módulo criado:

Health Module

✅ Primeiro endpoint funcional:

GET /health

Resposta:

```json
{
  "status": "ok",
  "service": "IBAG One API",
  "codename": "Project Nehemiah",
  "version": "0.1.0"
}
# 📂 Estrutura Atual

O projeto segue uma arquitetura de monorepo, onde diferentes aplicações e serviços convivem dentro do mesmo repositório.

```text
ibag-one
│
├── apps
│   ├── mobile        # Aplicativo dos membros
│   └── admin         # Painel administrativo
│
├── backend
│   └── api           # API principal do sistema
│       └── src
│           └── modules
│               └── health
│
├── docs              # Documentação do projeto
│
├── packages          # Pacotes compartilhados
│
├── shared            # Recursos compartilhados
│
└── infrastructure    # Configurações de infraestrutura
# 🧩 Domínios Planejados
O sistema será organizado pelos principais contextos da igreja:
👥 Pessoas
Cadastro, histórico, jornada espiritual e relacionamento.
# ⛪ Campi
Gestão da estrutura da igreja em diferentes locais.
# 🏠 Células
O principal domínio do sistema:
Redes;
Supervisores;
Líderes;
Líderes em treinamento;
Multiplicações;
Histórico das células.
# 🎵 Ministérios
Gestão de equipes e áreas de serviço.
Exemplos:
Louvor;
Recepção;
Dança;
Comunicação;
Outros ministérios.
# 📅 Eventos
Planejamento, agenda e acompanhamento.
# 📊 Dashboard Pastoral
Visão estratégica para liderança:
Saúde das células;
Crescimento;
Indicadores;
Acompanhamento pastoral.
# 📍 Status do Projeto
🚧 Em desenvolvimento
Fases
✅ Descoberta do Domínio (Domain Discovery)
✅ Documentação da visão do produto
✅ Fundação da arquitetura
✅ Primeiro Backend funcional
⌛ Modelagem de Domínio (DDD)
⌛ Desenvolvimento dos módulos principais
⌛ Aplicativo Mobile
⌛ Dashboard Administrativo
# 🏛️ Project Nehemiah
O nome do projeto representa a visão de reconstrução.
Assim como Neemias liderou a reconstrução dos muros de Jerusalém, o Project Nehemiah busca construir uma base sólida para fortalecer o cuidado, a liderança e a missão da igreja através da tecnologia.
# 🤝 Desenvolvimento
Este projeto está sendo construído com foco em:
Qualidade;
Simplicidade;
Escalabilidade;
Sustentabilidade.
Cada decisão técnica deve responder uma pergunta:
"Isso ajuda a igreja a cuidar melhor das pessoas?"

# 📜 Histórico Inicial
Primeiros marcos:
7d28bd8
Inicialização do repositório Project Nehemiah

↓

Documentação da visão e arquitetura

↓

Primeira API Backend criada

↓

Health Module implementado
# 💙 Nosso Norte
"Toda linha de código escrita neste projeto deve facilitar o cuidado com pessoas, fortalecer líderes e apoiar a missão da igreja."
