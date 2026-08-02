# System Context — IBAG One

## 1. Visão Geral

O IBAG One é uma plataforma digital para gestão integrada de igrejas, criada para conectar pessoas, Campus, ministérios, equipes, eventos e processos internos em um único ambiente.

A plataforma tem como objetivo reduzir a fragmentação das informações, substituir processos descentralizados e proporcionar uma visão clara das atividades, responsabilidades e necessidades da organização.

O IBAG One será desenvolvido com uma arquitetura escalável, preparada para atender múltiplas organizações religiosas e seus respectivos Campus.

---

# 2. Objetivo do Sistema

O IBAG One existe para ser o ponto central de organização e operação da igreja.

A plataforma busca resolver problemas como:

- Informações espalhadas em diferentes canais.
- Dependência excessiva de grupos de comunicação.
- Falta de visibilidade das responsabilidades.
- Dificuldade no acompanhamento das atividades dos ministérios.
- Falta de integração entre liderança, equipes e membros.

O sistema permitirá que líderes e membros tenham acesso às informações necessárias de forma organizada, segura e contextualizada.

---

# 3. Fronteira do Sistema

## O que pertence ao IBAG One

O IBAG One será responsável por:

- Gestão de organizações.
- Gestão de Campus.
- Gestão de usuários.
- Gestão de membros.
- Gestão de ministérios.
- Gestão de equipes.
- Gestão de eventos.
- Gestão de escalas.
- Gestão de tarefas e responsabilidades.
- Comunicação interna.
- Controle de permissões.
- Relatórios operacionais.

---

## O que não pertence ao IBAG One

O IBAG One não tem como objetivo substituir ferramentas externas especializadas.

Exemplos:

- Aplicativos de mensagens.
- Plataformas completas de pagamento.
- Sistemas contábeis.
- Ferramentas externas de calendário.

A estratégia será integrar essas soluções quando fizer sentido, mantendo o IBAG One como centro organizacional.

---

# 4. Atores do Sistema

## 4.1 Plataforma

### Super Administrador

Responsável pela administração global da plataforma.

Responsabilidades:

- Gerenciar organizações cadastradas.
- Configurar funcionalidades globais.
- Administrar suporte.
- Gerenciar configurações da plataforma.

---

# 4.2 Organização

## Administrador da Igreja

Responsável pela administração da organização dentro do IBAG One.

Responsabilidades:

- Configurar a organização.
- Criar e gerenciar Campus.
- Gerenciar usuários.
- Configurar permissões.
- Acompanhar indicadores gerais.

---

# 4.3 Campus

## Líder de Campus

Responsável pela operação local de um Campus.

Responsabilidades:

- Acompanhar ministérios.
- Supervisionar equipes.
- Visualizar eventos.
- Acompanhar demandas.
- Apoiar líderes locais.

---

# 4.4 Ministério

## Líder de Ministério

Responsável pela gestão de uma área específica da igreja.

Exemplos:

- Ministério de Louvor.
- Ministério de Dança.
- Ministério Kids.
- Ministério de Jovens.
- Ministério de Comunicação.
- Ministério de Intercessão.

Responsabilidades:

- Gerenciar equipes.
- Organizar atividades.
- Criar escalas.
- Distribuir responsabilidades.
- Acompanhar participantes.

---

# 4.5 Usuário

## Membro

Usuário final da plataforma.

Pode:

- Visualizar eventos.
- Participar de equipes.
- Receber comunicações.
- Atualizar informações pessoais.
- Acompanhar sua agenda.

---

# 5. Modelo Multi-Organização

O IBAG One será estruturado como uma plataforma multi-tenant.

Cada organização terá seus próprios dados, usuários, configurações e Campus isolados.

Exemplo:


IBAG ONE PLATFORM

Organização A
│
├── Campus Cachoeirinha
│
├── Campus Esteio
│
└── Ministérios

Organização B
│
├── Campus Central
│
└── Campus Norte


O modelo permite que diferentes organizações utilizem a plataforma mantendo segurança e separação de dados.

---

# 6. Contexto dos Principais Domínios

O IBAG One será dividido em módulos independentes.

Principais contextos:


IBAG ONE

├── Identidade e Acesso
│
├── Organização
│
├── Campus
│
├── Pessoas
│
├── Ministérios
│
├── Equipes
│
├── Eventos
│
├── Escalas
│
├── Comunicação
│
└── Relatórios


Cada módulo possuirá responsabilidades próprias e comunicação definida entre eles.

---

# 7. Sistemas Externos

O IBAG One poderá se integrar futuramente com sistemas externos.

## Comunicação

Possíveis integrações:

- WhatsApp.
- Email.
- Notificações Push.

Objetivo:

Permitir comunicação eficiente sem perder a organização das informações.

---

## Calendário

Possíveis integrações:

- Google Calendar.
- Outlook Calendar.

Objetivo:

Sincronização de eventos e agendas.

---

## Financeiro

Possíveis integrações:

- Sistemas financeiros.
- Plataformas de pagamento.
- Serviços de contribuição.

Objetivo:

Permitir recursos financeiros futuros sem acoplar o domínio principal.

---

# 8. Princípios Arquiteturais

## Escalabilidade

O sistema deve suportar crescimento de:

- Usuários.
- Organizações.
- Campus.
- Ministérios.

---

## Modularidade

Cada domínio deve ser desenvolvido de forma independente, permitindo evolução contínua.

---

## Segurança

O acesso às informações deve respeitar:

- Organização.
- Campus.
- Ministério.
- Função do usuário.

---

## Clareza

A informação correta deve estar disponível para a pessoa correta no momento correto.

---

# 9. Visão Final

O IBAG One será uma plataforma que transforma a gestão da igreja em um ambiente conectado, organizado e escalável.

A plataforma deve permitir que líderes tenham visão, equipes tenham direção e membros tenham participação ativa na vida da igreja.
