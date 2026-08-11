# Domínio: Área de Serviço

## Propósito

Áreas de serviço conectam pessoas, dons e missão. Elas não substituem a célula: a célula é o ambiente de cuidado e discipulado; a área organiza o voluntariado e a atuação da pessoa.

```text
Pessoa
├── participa de uma célula
└── pode servir em uma ou mais áreas de serviço
    └── atua em uma ou mais equipes
```

## Estrutura implementada

Uma área pode ser global, atendendo toda a organização, ou local, vinculada a um campus. Cada equipe pertence a uma área e a um campus.

```text
Área de serviço
├── Liderança geral
├── Liderança de campus
├── Equipes
│   ├── Liderança de equipe
│   └── Integrantes
├── Processo de entrada e formação
└── Escalas
```

Papéis de vínculo disponíveis:

- `GENERAL_LEADER`
- `CAMPUS_LEADER`
- `TEAM_LEADER`
- `MEMBER`

Funções operacionais complementam o vínculo de equipe. O primeiro papel implementado é `WORSHIP_MINISTER`, destinado ao integrante que pode enviar repertórios de cultos. O vínculo também pode registrar funções de escala, como Guitarra, Baixo ou Vocal, sem substituir seu papel de liderança ou integrante.

## Entrada e formação

Cada área configura suas próprias etapas. Não há um funil obrigatório para todas as áreas.

Exemplos:

- Música: interesse, audição, avaliação e treinamento.
- Recepção: interesse, treinamento e acompanhamento.

Uma pessoa se torna integrante apenas quando a liderança aprova seu processo e escolhe uma equipe. Etapas obrigatórias ativas precisam estar concluídas. Processos encerrados por aprovação, recusa ou desistência permanecem registrados.

## Escalas

Cada área possui sua visão consolidada de escalas, e cada equipe administra as suas escalas.

- Liderança geral visualiza toda a área.
- Liderança de campus visualiza as equipes do seu campus.
- Liderança de equipe visualiza e administra a própria equipe.
- Integrantes consultam as próprias escalas e respondem com confirmação ou recusa.

As escalas podem estar vinculadas a eventos, mas não pertencem à Ordem de Culto. A API impede conflitos ativos de agenda, permite criação em lote e registra histórico de criação, mudança de status e substituição.

O integrante escalado pode solicitar uma troca antes do horário previsto. A busca oferece somente integrantes ativos da mesma equipe, que tenham a mesma função registrada e não possuam conflito. A troca só é efetivada quando a liderança da equipe aprova; uma recusa mantém a escala original.

## Histórico

Vínculos são encerrados, não apagados. Escalas mantêm histórico auditável com usuário responsável, status anterior/novo, pessoas envolvidas em substituição e motivo opcional.

## Extensão futura

O fluxo atual cobre etapas de entrada e sua comprovação. Um catálogo central de cursos, turmas, presença e certificados pode ser adicionado futuramente sem alterar a regra de que cada área possui seu próprio processo.
