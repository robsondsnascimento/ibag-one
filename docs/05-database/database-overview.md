# 🗄️ IBAG One - Visão Geral do Banco de Dados

## Contexto

O banco de dados do IBAG One será responsável por armazenar a história, relacionamentos e operações da igreja.

O sistema não deve ser tratado apenas como um cadastro.

O banco deve representar:

- pessoas;
- famílias;
- cuidado pastoral;
- células;
- serviços;
- eventos;
- cultos;
- comunicação;
- histórico.

---

# Princípios do Banco

## 1. Uma pessoa, uma história

A pessoa é a entidade central do sistema.

Todas as informações devem estar relacionadas à pessoa.

Exemplo:

```
Pessoa

↓

Família

↓

Célula

↓

Área de Serviço

↓

Histórico
```

---

# 2. Nunca apagar informações importantes

O sistema deve preservar histórico.

Não utilizar exclusão física para dados relevantes.

Exemplo:

Uma pessoa que mudou de Campus:

```
2026

Campus Cachoeirinha


2030

Campus Esteio
```

Todo histórico permanece.

---

# 3. Preparado para múltiplas igrejas

O banco deve nascer preparado para expansão.

Estrutura:

```
Plataforma

↓

Organização

↓

Igreja

↓

Campus
```

Hoje:

```
IBAG
```

Futuro:

```
IBAG

+

outras organizações
```

---

# Arquitetura inicial das entidades

```
ORGANIZATION

        |

      CHURCH

        |

      CAMPUS

        |

 ---------------------------------

 |          |          |           |

PEOPLE    CELLS    EVENTS     SERVICES

 |
 |
 --------------------------------

 |
FAMILY

 |
DOCUMENTS

 |
ACCOUNT

 |
ROLES
```

---

# Entidades principais

---

# 🏛️ Organização

Representa uma instituição dentro da plataforma.

Exemplo:

```
IBAG
```

Responsável por:

- igrejas;
- configurações;
- expansão futura.

---

# ⛪ Igreja

Representa uma igreja dentro de uma organização.

Hoje:

```
IBAG
```

Futuramente:

```
IBAG Global

↓

IBAG Brasil

↓

IBAG Internacional
```

---

# 📍 Campus

Representa uma unidade local.

Na IBAG:

```
Cada Campus é uma IBAG em uma cidade.
```

Exemplo:

```
Campus Cachoeirinha

Campus Esteio
```

---

# 👤 Pessoa

Entidade principal.

Representa qualquer indivíduo relacionado à igreja.

Exemplos:

- adulto;
- criança;
- líder;
- membro;
- integrante.

Uma pessoa pode possuir:

- família;
- célula;
- serviços;
- papéis;
- histórico.

---

# 👨‍👩‍👧 Família

Agrupa pessoas relacionadas.

Exemplo:

```
Família Oliveira

João

Maria

Lucas
```

Relacionamentos:

- pai;
- mãe;
- filho;
- responsável.

---

# 🟦 Kids

O módulo Kids utiliza a mesma entidade Pessoa.

Uma criança é uma pessoa.

Informações adicionais:

- turma;
- sala;
- responsáveis autorizados;
- necessidades especiais;
- histórico de check-in.

---

# Check-in Kids

Representa o controle de entrada e saída.

Fluxo:

```
Responsável

↓

Check-in

↓

Criança participa

↓

Notificação

↓

Responsável busca

↓

Check-out
```

---

# Necessidades especiais

Informações sensíveis.

Exemplos:

- alergias;
- restrições alimentares;
- necessidades físicas;
- necessidades cognitivas.

Controle de acesso obrigatório.

---

# 📱 Conta IBAG One

Representa a identidade digital.

Modelo:

```
Pessoa

↓

Conta IBAG One

↓

Papéis

↓

Permissões
```

Exemplo:

```
joao.silva@ibag.one
```

---

# 🌱 Célula

Representa o ambiente de cuidado e discipulado.

Relacionamentos:

```
Campus

↓

Rede

↓

Célula

↓

Líderes

↓

Participantes
```

---

# 🤝 Área de Serviço

Representa onde uma pessoa serve.

Exemplo:

```
Louvor

Recepção

Kids

Comunicação
```

Relacionamentos:

```
Área

↓

Equipe

↓

Integrantes

↓

Escalas
```

---

# 📅 Evento

Representa programações.

Relacionamentos:

```
Evento

↓

Campus

↓

Espaços

↓

Responsáveis

↓

Notificações
```

---

# ⛪ Culto

É um tipo especial de evento.

Possui:

- ordem de culto;
- itens;
- responsáveis;
- materiais;
- demandas.

---

# 🏢 Espaço

Representa ambientes físicos.

Exemplo:

```
Templo

Espaço Conecta

Espaço Kids

Espaço Convivência
```

Pertence a:

```
Campus
```

---

# 🔔 Notificação

Sistema transversal.

Pode nascer de:

- eventos;
- Kids;
- escalas;
- células;
- comunicação pastoral.

---

# 📜 Documentos

Relacionados à pessoa.

Exemplos:

- certificados;
- cursos;
- documentos administrativos.

---

# Histórico

Todas as alterações relevantes devem ser registradas.

Exemplo:

```
Pessoa mudou Campus

Pessoa mudou célula

Pessoa assumiu liderança

Pessoa iniciou serviço
```

---

# Futuras extensões

O banco deve permitir evolução para:

- check-in completo Kids;
- cursos;
- discipulado;
- comunicação avançada;
- relatórios pastorais;
- inteligência de dados.

---

# Objetivo

Criar uma base de dados que permita responder:

"Quem é essa pessoa?"

"Quem cuida dela?"

"Como está sua caminhada?"

"Como ela serve?"

"Como podemos cuidar melhor dela?"
