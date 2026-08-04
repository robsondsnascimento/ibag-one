# 🏢 Domínio: Espaço

## Contexto

O domínio Espaço representa os ambientes físicos disponíveis para utilização dentro de cada Campus.

---

# Estrutura

```
IBAG

|

Campus

|

Espaços
```

---

# Exemplos

Campus Cachoeirinha:

```
Templo

Espaço Conecta

Espaço Kids

Espaço Convivência

Salas
```

---

# Características

Um espaço possui:

- nome;
- Campus;
- capacidade;
- recursos;
- disponibilidade.

---

# Reserva

A reserva relaciona:

```
Evento

+

Data/Horário

+

Espaço
```

---

# Secretaria

Inicialmente a Secretaria Geral administra os espaços de todos os Campi.

Futuramente poderá existir:

```
Secretaria Geral

↓

Secretaria de Campus
```

---

# Conflitos

O sistema deve impedir conflitos.

Exemplo:

```
Espaço Conecta

15/08

09:00

Reservado
```

Nova solicitação:

```
Espaço Conecta

15/08

09:00
```

Resultado:

Bloqueado.
