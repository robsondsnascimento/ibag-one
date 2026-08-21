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

A cadeia de cuidado exibida na Área de Serviço começa pelos Pastores Sênior da organização, segue pelos Pastores ativos, liderança geral da Área, lideranças de campus e de equipe, até os voluntários de cada equipe. O papel pastoral vem do usuário da pessoa; os demais níveis vêm dos vínculos ativos da Área de Serviço. A ausência de pessoa em um nível não remove o nível da árvore: ele é apresentado como `Não definido`.

As funções de serviço complementam o vínculo de equipe, sem substituir seu papel de liderança ou integrante. Cada Área de Serviço possui seu próprio catálogo de funções, gerido por secretaria, administração ou super administração. As funções cadastradas são as opções padronizadas para os vínculos das pessoas e para as escalas daquela área.

A Área de Serviço **Música** inicia com o catálogo `Ministro`, `Backing Vocal`, `Guitarra`, `Violão`, `Baixo`, `Tecladista`, `Bateria` e `Percussão`. Uma pessoa pode receber mais de uma função na mesma equipe. Por exemplo, ela pode ser Tecladista na escala e Ministro de Louvor na equipe; a função Ministro libera o repertório quando houver escala confirmada no culto.

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

As escalas podem estar vinculadas a eventos, mas não pertencem à Ordem de Culto. Para uma equipe, o painel apresenta em calendário apenas os **Cultos aprovados** do seu campus. Ao criar uma escala sem escolher Culto, a API procura automaticamente um Culto aprovado no mesmo campus, data e horário e faz o vínculo quando o encontrar. Ao aprovar ou atualizar um Culto, a API também vincula as escalas independentes já existentes naquele mesmo campus e horário. A API impede conflitos ativos de agenda, permite criação em lote e registra histórico de criação, mudança de status e substituição.

O integrante escalado pode solicitar uma troca antes do horário previsto. A busca oferece somente integrantes ativos da mesma equipe, que tenham a mesma função registrada e não possuam conflito. A troca só é efetivada quando a liderança da equipe aprova; uma recusa mantém a escala original.

## Histórico

Vínculos são encerrados, não apagados. A alteração da área ou equipe de uma pessoa encerra o vínculo anterior e cria outro vínculo ativo, preservando o histórico. Escalas mantêm histórico auditável com usuário responsável, status anterior/novo, pessoas envolvidas em substituição e motivo opcional.

## Administração e disponibilidade

Áreas de Serviço e equipes possuem nome, descrição e status de disponibilidade. O escopo da área e o campus de origem de uma equipe são estruturais: não são alterados depois da criação, evitando que vínculos, escalas e histórico mudem de contexto.

- Secretaria, administração e super administração podem editar e ativar/inativar uma Área de Serviço.
- Lideranças autorizadas da área podem editar e ativar/inativar as equipes dentro do escopo que já administram; a API confirma essa permissão.
- Ao inativar uma área, todas as equipes ativas dela também são inativadas na mesma operação. Pessoas, funções operacionais, escalas e seus históricos permanecem preservados.
- Ao reativar uma área, suas equipes continuam inativas até que uma liderança as reative explicitamente. Isso evita a reabertura acidental de uma operação inteira.
- Uma equipe não pode ser reativada enquanto sua área estiver inativa. Equipes ou áreas inativas não recebem novos vínculos, funções operacionais ou escalas.

## Extensão futura

O fluxo atual cobre etapas de entrada e sua comprovação. Um catálogo central de cursos, turmas, presença e certificados pode ser adicionado futuramente sem alterar a regra de que cada área possui seu próprio processo.
