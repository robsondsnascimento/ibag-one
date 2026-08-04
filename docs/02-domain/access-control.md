# 🔐 Domínio: Conta IBAG One, Papéis e Permissões

## Contexto

O domínio de Controle de Acesso representa a identidade digital das pessoas dentro do ecossistema IBAG One.

A conta não representa apenas um usuário de sistema.

Ela representa a identidade da pessoa, suas responsabilidades, seus papéis e seu relacionamento com a igreja.

---

# 🆔 Conceito principal

O modelo utilizado será:

```
Pessoa

↓

Conta IBAG One

↓

Papéis

↓

Permissões

↓

Escopo
```

---

# 👤 Pessoa x Conta

Uma pessoa possui uma única identidade dentro do sistema.

Regra:

```
1 Pessoa

↓

1 Conta IBAG One

↓

Vários papéis
```

Não serão criadas contas diferentes para cada função.

---

# Exemplo

Pessoa:

```
João Silva
```

Conta:

```
joao.silva@ibag.one
```

Papéis:

```
Membro

Líder de Célula

Integrante de Louvor
```

---

# 🌎 Identidade contínua

A conta acompanha a história da pessoa.

Exemplo:

```
Maria Silva

2026

Campus Cachoeirinha

Integrante Recepção


2030

Campus Esteio

Líder Louvor
```

A mudança de Campus ou função não cria uma nova identidade.

---

# 📧 Conta IBAG One

A conta utiliza o conceito:

```
nome.sobrenome@ibag.one
```

Inicialmente:

- identificação;
- autenticação;
- acesso ao aplicativo;
- controle de permissões.

No futuro poderá evoluir para:

- e-mail institucional;
- ferramentas colaborativas;
- documentos;
- calendário;
- ambiente digital IBAG.

---

# 🔑 Autenticação

O sistema deve permitir evolução futura.

Possíveis métodos:

```
Email IBAG One + senha

Telefone + código

Provedores externos
```

A autenticação deve ser independente das permissões.

---

# 👥 Papéis

Papéis representam responsabilidades.

Exemplo:

```
MEMBRO

PASTOR_SENIOR

PASTOR

COORDENADOR

SUPERVISOR

LIDER_CELULA

LIDER_SERVICO

INTEGRANTE_SERVICO

SECRETARIA
```

---

# 🔄 Múltiplos papéis

Uma pessoa pode possuir vários papéis.

Exemplo:

```
Robson

MEMBRO

+

LIDER_SERVICO

+

LIDER_CELULA
```

---

# 🔐 Permissões

Permissões representam ações disponíveis.

Modelo:

```
Recurso

+

Ação
```

Exemplos:

```
Pessoa.Visualizar

Pessoa.Editar

Evento.Criar

Evento.Aprovar

Escala.Editar

Espaco.Reservar
```

---

# 🌎 Escopo

Toda permissão possui um alcance.

Exemplo:

```
IBAG inteira

Campus

Rede

Célula

Área de Serviço

Equipe
```

---

# Exemplos de acesso

## Pastor Senior

Escopo:

```
Toda IBAG
```

Pode:

```
Visualizar todos os Campi

Aprovar eventos pastorais

Acompanhar líderes

Acompanhar células
```

---

## Líder de Campus

Escopo:

```
Seu Campus
```

Pode:

```
Acompanhar equipes locais

Visualizar agenda do Campus

Gerenciar responsabilidades permitidas
```

---

## Supervisor

Escopo:

```
Suas redes e células
```

Pode:

```
Acompanhar líderes

Acompanhar células
```

---

## Líder de Célula

Escopo:

```
Sua célula
```

Pode:

```
Cuidar das pessoas da célula

Registrar informações permitidas
```

---

## Líder de Área de Serviço

Escopo:

```
Sua área/equipe
```

Pode:

```
Gerenciar integrantes

Criar escalas

Solicitar eventos
```

---

## Secretaria Geral

Escopo:

```
Todos os Campi
```

Pode:

```
Gerenciar cadastros

Gerenciar espaços

Organizar agenda
```

---

# 👁️ Membro

O membro possui acesso ao aplicativo.

Pode:

```
Visualizar sua agenda

Ver eventos

Receber notificações

Acompanhar sua célula

Visualizar suas escalas
```

---

# 🚫 Usuários externos

Inicialmente:

```
Não permitido
```

O IBAG One trabalha com pessoas vinculadas à IBAG.

---

# Princípios

## Uma pessoa, uma história

Nenhuma mudança deve apagar histórico.

---

## Funções mudam, identidade permanece

Uma pessoa pode crescer, mudar de Campus ou assumir novas responsabilidades.

---

## Permissões devem ser flexíveis

O sistema não deve depender de cargos fixos.

Novos papéis podem surgir no futuro.

---

# Visão futura

A Conta IBAG One pode se tornar uma identidade digital completa:

```
Conta IBAG One

↓

Aplicativo

↓

Cursos

↓

Documentos

↓

Comunicação

↓

Serviços digitais
```

---

# Objetivo final

Criar uma identidade única que acompanhe cada pessoa durante toda sua caminhada dentro da IBAG.
