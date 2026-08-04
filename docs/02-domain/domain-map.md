# 🧭 Mapa de Domínio - IBAG One

## Objetivo

Este documento apresenta uma visão geral dos principais domínios do IBAG One.

O objetivo é organizar o conhecimento da realidade da igreja antes da implementação técnica.

Cada domínio representa uma área importante da operação, cuidado e missão da IBAG.

---

# 🏛️ Visão Geral

O IBAG One é organizado ao redor das pessoas e dos relacionamentos.

Modelo central:

```
                    Igreja

                       |
                       |

                    Pessoas

                       |
        --------------------------------

        |              |              |

      Célula       Ministério       Família

        |

     Liderança

        |

   Cuidado Pastoral
```

---

# 👥 1. Pessoa

## Descrição

Representa cada indivíduo que possui uma história dentro da igreja.

É o domínio central da plataforma.

## Responsabilidades

- Identidade;
- Jornada espiritual;
- Histórico;
- Família;
- Campus;
- Célula;
- Ministérios.

## Documento

```
person.md
```

Status:

✅ Modelado

---

# ⛪ 2. Campus

## Descrição

Representa uma unidade local da IBAG.

Cada Campus está relacionado a uma cidade e possui sua própria estrutura local.

## Responsabilidades

- Localização;
- Liderança;
- Pessoas vinculadas;
- Células;
- Ministérios locais.

Status:

⌛ A definir

---

# 🏠 3. Células

## Descrição

Representa o principal ambiente de cuidado e discipulado da igreja.

A célula conecta pessoas, líderes e acompanhamento pastoral.

## Responsabilidades

- Redes;
- Supervisores;
- Líderes;
- Líderes em treinamento;
- Anfitriões;
- Multiplicações;
- Histórico.

Status:

⌛ A definir

---

# 🎵 4. Ministérios

## Descrição

Representa as áreas onde pessoas servem.

Uma pessoa pode participar de múltiplos ministérios.

## Exemplos

- Louvor;
- Recepção;
- Dança;
- Comunicação;
- Mídia;
- Outros serviços.

Status:

⌛ A definir

---

# 📅 5. Eventos

## Descrição

Representa atividades, encontros e programações da igreja.

## Responsabilidades

- Agenda;
- Solicitações;
- Organização;
- Participantes;
- Histórico.

Status:

⌛ A definir

---

# 🔐 6. Identidade e Permissões

## Descrição

Responsável por controlar acessos e responsabilidades dentro do sistema.

## Possíveis perfis

- Pastor;
- Supervisor;
- Líder;
- Secretaria;
- Membro.

Status:

⌛ A definir

---

# 📊 7. Indicadores e Dashboard

## Descrição

Camada de inteligência do sistema.

Transforma dados em informações para liderança.

## Exemplos

- Saúde das células;
- Crescimento;
- Pessoas sem acompanhamento;
- Multiplicações;
- Desenvolvimento de líderes.

Status:

⌛ A definir

---

# 🔗 Relacionamentos Principais

Modelo inicial:

```
Pessoa

 |
 |
 +---- pertence ---- Campus

 |
 |
 +---- participa ---- Célula

 |
 |
 +---- serve ---- Ministério

 |
 |
 +---- pertence ---- Família
```

---

# 🧱 Princípios de Modelagem

## História acima de alteração

Informações importantes não devem simplesmente ser substituídas.

Devem gerar histórico.

---

## Pessoas acima de cadastros

O sistema acompanha jornadas, não apenas registros.

---

## Domínios independentes

Cada área deve possuir suas próprias responsabilidades.

---

## Evolução contínua

O modelo deve crescer junto com a realidade da igreja.

---

# 🏛️ Norte do Domínio

Antes de criar qualquer funcionalidade, devemos responder:

> "Como isso ajuda a igreja a cuidar melhor das pessoas?"
