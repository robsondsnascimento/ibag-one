# ADR-004: Contexto de Organização na Aplicação

## Status

Aceito

## Data

06/08/2026

---

# Contexto

A plataforma ONE foi projetada para atender múltiplas organizações independentes.

Cada organização representa uma igreja utilizando a plataforma.

Exemplos:

- IBAG
- Igreja Central
- Igreja Esperança

Com a adoção da arquitetura Multi-Tenant, tornou-se necessário definir como a aplicação identifica e controla o contexto de cada organização.

Toda informação criada dentro da plataforma deve estar vinculada a uma organização específica.

---

# Problema

Sem um contexto de organização bem definido, existe o risco de:

- usuários acessarem dados de outra igreja;
- consultas retornarem informações de múltiplas organizações;
- permissões serem aplicadas incorretamente;
- funcionalidades futuras dependerem de regras específicas de uma igreja.

Exemplo de problema:

Um usuário da IBAG executa uma consulta de pessoas.

O sistema não deve retornar:

```
IBAG
- Robson Damião

Igreja Central
- João Silva
```

Apenas dados pertencentes à organização autenticada devem ser retornados.

---

# Decisão

Toda requisição da aplicação deverá possuir um contexto de organização.

Esse contexto será utilizado para:

- autenticação;
- autorização;
- consultas;
- criação de registros;
- auditoria.

A organização será identificada através do usuário autenticado.

---

# Modelo de contexto

O fluxo será:

```
Usuário

   |

Autenticação

   |

JWT Token

   |

organizationId

   |

Aplicação

   |

Dados filtrados pela organização
```

---

# JWT e Organização

O token de autenticação deverá carregar informações da organização.

Exemplo:

```json
{
  "sub": "usuario-id",
  "organizationId": "org_ibag_one",
  "role": "ADMIN"
}
```

O campo:

```
organizationId
```

será utilizado pela aplicação para determinar o escopo dos dados.

---

# Regras de desenvolvimento

Nenhum serviço deverá buscar dados sem considerar a organização.

Evitar:

```typescript
prisma.person.findMany()
```

Preferir:

```typescript
prisma.person.findMany({
  where: {
    organizationId
  }
})
```

---

# Aplicação das regras

## Pessoas

Cada pessoa pertence a uma organização.

Exemplo:

```
IBAG

- Robson Damião


Igreja Central

- João Silva
```

---

## Usuários

Cada usuário pertence a uma organização.

Exemplo:

```
robson.damiao@ibag.one

organization:
IBAG
```

---

## Campus

Cada Campus pertence a uma organização.

Exemplo:

```
IBAG

- Cachoeirinha
- Esteio


Igreja Central

- Sede
```

---

## Ministérios

Cada organização terá seus próprios ministérios.

Exemplo:

```
IBAG

- Louvor
- Comunicação


Igreja Central

- Música
- Infantil
```

---

# Benefícios

## Segurança

Garante isolamento entre organizações.

## Escalabilidade

Permite crescimento para milhares de igrejas.

## Manutenção

As regras de negócio permanecem genéricas.

## Auditoria

Permite rastrear todas as ações dentro de uma organização.

---

# Consequências

Todos os novos módulos deverão considerar o contexto da organização.

Novos modelos Prisma deverão possuir relacionamento com Organization quando representarem dados específicos de uma igreja.

Exemplo:

```
Organization
      |
      |
    Entity
```

---

# Resumo

A plataforma ONE utilizará o conceito de contexto organizacional.

Cada usuário autenticado atuará dentro de uma organização específica, garantindo isolamento, segurança e escalabilidade.

A regra principal:

> Nenhum dado existe fora de uma organização.
