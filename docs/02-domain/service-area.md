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

As funções de serviço complementam o vínculo de equipe, sem substituir seu papel de liderança ou integrante. Na Área de Serviço **Música**, a função **Ministro** identifica quem pode preparar e enviar repertórios de cultos.

Na Área de Serviço **Música**, as funções de escala são escolhidas em seleção múltipla para manter nomes consistentes nas escalas e nas solicitações de troca: Ministro, Backing Vocal, Guitarra, Violão, Baixo, Tecladista, Bateria e Percussão. Uma pessoa pode receber mais de uma delas. Por exemplo, a mesma pessoa pode ser Tecladista na escala e Ministro de Louvor na equipe; a função Ministro libera o repertório quando ela estiver escalada e confirmada no culto.

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

## Administração e disponibilidade

Áreas de Serviço e equipes possuem nome, descrição e status de disponibilidade. O escopo da área e o campus de origem de uma equipe são estruturais: não são alterados depois da criação, evitando que vínculos, escalas e histórico mudem de contexto.

- Secretaria, administração e super administração podem editar e ativar/inativar uma Área de Serviço.
- Lideranças autorizadas da área podem editar e ativar/inativar as equipes dentro do escopo que já administram; a API confirma essa permissão.
- Ao inativar uma área, todas as equipes ativas dela também são inativadas na mesma operação. Pessoas, funções operacionais, escalas e seus históricos permanecem preservados.
- Ao reativar uma área, suas equipes continuam inativas até que uma liderança as reative explicitamente. Isso evita a reabertura acidental de uma operação inteira.
- Uma equipe não pode ser reativada enquanto sua área estiver inativa. Equipes ou áreas inativas não recebem novos vínculos, funções operacionais ou escalas.

## Extensão futura

O fluxo atual cobre etapas de entrada e sua comprovação. Um catálogo central de cursos, turmas, presença e certificados pode ser adicionado futuramente sem alterar a regra de que cada área possui seu próprio processo.
