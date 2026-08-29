# 📅 Domínio: Evento

## Contexto

O domínio Evento representa as programações realizadas pela IBAG.

Um evento pode envolver pessoas, áreas de serviço, espaços físicos, comunicação, aprovação e tarefas operacionais.

O evento não é apenas um registro de calendário, mas uma operação que precisa acontecer.

---

# 🎯 Objetivo

Permitir:

- criar eventos;
- solicitar eventos;
- aprovar quando necessário;
- reservar espaços;
- definir responsáveis;
- enviar comunicações;
- acompanhar execução.

---

# 🏛️ Relação com Campus

Todo evento pertence a um Campus.

Modelo:

```
IBAG

|

Campus

|

Eventos
```

---

# Tipos de Evento

Um evento pode possuir diferentes classificações:

```
Evento Pastoral

Evento de Área de Serviço

Treinamento

Ensaio

Reunião

Culto

Conferência

Programação Especial
```

---

# Fluxo de criação

Nem todo evento precisa de aprovação.

O fluxo depende do tipo.

---

## Evento Pastoral

Exemplos:

- Conferências;
- Páscoa;
- Grandes celebrações.

Fluxo:

```
Solicitação

↓

Aprovação Pastor Senior

↓

Execução
```

---

## Evento de Área de Serviço

Exemplos:

- ensaio;
- treinamento;
- reunião.

Fluxo:

```
Líder da Área

↓

Solicitação

↓

Secretaria verifica disponibilidade

↓

Reserva confirmada
```

---

# Responsáveis

Um evento possui:

- solicitante;
- responsável principal;
- equipes envolvidas.

---

# Espaços

Um evento pode utilizar um ou vários espaços.

Exemplo:

```
Conferência

├── Templo

├── Espaço Kids

└── Espaço Conecta
```

---

# Comunicação

Eventos podem gerar alertas.

Configuração:

```
Enviar alerta?

Sim / Não
```

Público:

```
Toda igreja

Campus

Área de Serviço

Equipe

Pessoas específicas
```

---

# Checklist

Um evento pode gerar pendências.

Exemplo:

```
Conferência

☐ Reservar espaço

☐ Criar artes

☐ Preparar som

☐ Organizar recepção
```

---

# Histórico

Eventos devem manter histórico.

## Recorrência

Um evento pode ser pontual, semanal ou mensal. Uma recorrência sempre possui data final e é materializada como ocorrências individuais para que cada data preserve seu próprio status, checklist, cancelamento, conflitos, escalas e sincronização externa. A edição de uma ocorrência não altera as demais; uma mudança de frequência exige uma nova série. Em uma série de Cultos aprovados, cada ocorrência recebe sua própria Ordem de Culto a partir do modelo padrão quando o modelo estiver ativo e for compatível com as Áreas de Serviço selecionadas.

Nada importante deve ser perdido.

---

# Regra especial

Eventos gerais de Campus podem bloquear outros eventos simultâneos.
