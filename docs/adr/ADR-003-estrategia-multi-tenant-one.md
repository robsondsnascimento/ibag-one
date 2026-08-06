# ADR-003: Estratégia Multi-Tenant e conceito ONE como plataforma

## Status

Aceito

## Data

06/08/2026

---

# Contexto

O projeto IBAG One nasceu com o objetivo de centralizar processos, pessoas, liderança, ministérios, células e eventos da Igreja Batista Aliança Global.

Durante a evolução da arquitetura, surgiu a possibilidade de transformar a solução em uma plataforma capaz de atender diferentes igrejas, mantendo isolamento de dados e personalização por organização.

A nomenclatura "ONE" representa a visão de uma plataforma unificada para conectar pessoas, liderança e operação da igreja.

Exemplos futuros:

- IBAG One
- Central One
- Igreja Esperança One

A arquitetura deve permitir que diferentes igrejas utilizem a mesma plataforma sem compartilharem dados entre si.

---

# Decisão

A plataforma será construída seguindo o modelo Multi-Tenant.

Cada igreja será representada como uma organização independente dentro da plataforma.

O conceito será:

```text
ONE Platform

        |
        |
   Organization

        |
  ----------------
  |              |
 IBAG          Central

        |
 Usuários, Pessoas, Campus,
 Ministérios, Células e Eventos
```

---

# Conceito de Organização

Será criada uma entidade principal chamada:

```text
Organization
```

Responsável por representar uma igreja dentro da plataforma.

Exemplo:

```text
Organization

id:
001

nome:
IBAG

dominio:
ibag.one
```

Outra organização:

```text
Organization

id:
002

nome:
Igreja Central

dominio:
central.one
```

---

# Impacto nos usuários

Usuários não serão vinculados diretamente apenas ao domínio IBAG.

A identidade deverá considerar a organização pertencente ao usuário.

Exemplo:

IBAG:

```text
robson.damiao@ibag.one
```

Igreja Central:

```text
joao.silva@central.one
```

A regra de geração de identidade será baseada na organização pertencente ao usuário.

---

# Arquitetura de relacionamento

A estrutura futura será:

```text
Organization

    |
    |
    +---- Users

    +---- Persons

    +---- Campus

    +---- Ministérios

    +---- Events
```

---

# Impactos previstos

## User

Usuários pertencerão a uma organização.

Exemplo:

```text
Organization

      |

     User
```

Cada usuário terá contexto da organização para autenticação e permissões.

---

## Person

Pessoas pertencerão a uma organização.

Exemplo:

```text
Organization

      |

    Person
```

Isso permitirá que diferentes igrejas tenham pessoas diferentes utilizando a mesma plataforma.

---

## Campus

Uma organização poderá possuir vários Campus.

Exemplo:

```text
IBAG

- Cachoeirinha
- Esteio
- Centro
```

Outra organização:

```text
Igreja Central

- Sede
- Zona Sul
```

---

## Ministérios

Cada organização possuirá seus próprios ministérios.

Exemplo:

```text
IBAG

- Louvor
- Dança
- Comunicação
- Infantil
```

Outra igreja poderá possuir estruturas diferentes conforme sua realidade.

---

## Eventos

Eventos serão isolados por organização.

Cada igreja terá sua própria agenda, participantes e histórico.

---

# Benefícios

## Escalabilidade

Permite que diversas igrejas utilizem a mesma plataforma.

## Isolamento de dados

Cada organização terá seus próprios dados protegidos e separados.

## Personalização

Cada organização poderá possuir:

- domínio próprio;
- identidade visual;
- configurações próprias;
- permissões próprias;
- regras específicas.

## Evolução comercial

Permite transformar o ONE em uma plataforma SaaS.

---

# Decisões técnicas futuras

Antes da implementação completa de autenticação, deverá existir:

- entidade Organization;
- relacionamento Organization → User;
- relacionamento Organization → Person;
- contexto da organização durante autenticação;
- isolamento das consultas por organização.

---

# Regras de desenvolvimento

O código não deve possuir regras fixas exclusivamente para uma igreja.

Evitar:

```text
if (igreja === IBAG)
```

Preferir:

```text
organization.settings
```

As regras devem ser baseadas na configuração da organização.

---

# Consequências

A arquitetura inicial precisará considerar que o IBAG é apenas a primeira organização utilizando a plataforma.

O sistema deverá nascer preparado para múltiplas igrejas.

Alterações futuras no banco deverão considerar o contexto da organização antes de adicionar novas funcionalidades.

---

# Resumo

O IBAG One será desenvolvido como a primeira implementação da plataforma ONE.

O objetivo futuro é permitir que múltiplas igrejas utilizem a mesma tecnologia através de organizações independentes.

A visão:

> Uma plataforma. Muitas igrejas. Um ecossistema conectado.
