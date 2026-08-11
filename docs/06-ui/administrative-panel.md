# Painel administrativo

## Áreas de Serviço

O menu lateral agrupa as áreas cadastradas abaixo de **Áreas de Serviço**. O grupo pode ser recolhido e expandido; cada área abre seu próprio espaço no painel.

A visão da área selecionada consulta `GET /service-areas/:id` e apresenta, respeitando a organização autenticada:

- escopo global ou de campus;
- equipes ativas e seus campi;
- liderança geral, liderança de campus e liderança de equipe;
- integrantes ativos, equipe e data inicial do vínculo.

Pessoas com permissão de gestão veem ações conforme seu vínculo na área:

- secretaria, administração e super administração gerenciam equipes e vínculos;
- liderança geral também pode criar equipes;
- lideranças da área podem vincular pessoas dentro do escopo que a API autoriza.

O painel já permite criar equipes e vincular uma pessoa como integrante, liderança de equipe, liderança de campus ou liderança geral. A API permanece responsável pela validação final de escopo, campus, equipe e permissão.

## Funções operacionais

Cada Área de Serviço apresenta uma seção de **Funções operacionais** por equipe. A liderança autorizada pode atribuir ou encerrar o papel de **Ministro de Louvor** para uma pessoa que já seja integrante ativo daquela equipe. A função não substitui o vínculo de integrante ou liderança e permanece limitada à equipe escolhida; ela habilita o fluxo de repertório de cultos.

## Entrada e formação

Na visão de uma área, lideranças autorizadas acessam **Entrada e formação** para:

- configurar as etapas, indicando quais são obrigatórias;
- registrar o interesse de uma pessoa, com equipe desejada opcional;
- iniciar o acompanhamento;
- concluir cada etapa;
- aprovar a pessoa para uma equipe após cumprir as etapas obrigatórias.

A aprovação cria a membresia de integrante na equipe em uma única operação. Processos aprovados, recusados ou encerrados por desistência continuam visíveis como histórico. A liderança geral também pode editar, ativar/desativar e reorganizar as etapas ativas; uma etapa desativada deixa de ser exigida nos novos acompanhamentos. As escalas continuam em seu fluxo próprio.

## Escalas por área e equipe

Cada Área de Serviço exibe sua visão consolidada de escalas, sempre filtrada pelo escopo que a API autoriza à pessoa conectada. O painel permite:

- consultar escalas por período, equipe e status;
- criar uma escala individual ou em lote para pessoas com vínculo ativo na mesma equipe, de forma independente ou vinculada a um evento aprovado que envolva a equipe;
- visualizar a função, a pessoa, a equipe, o evento relacionado quando existir e observações;
- confirmar ou recusar a própria escala, com motivo opcional na recusa;
- concluir ou reabrir uma escala pela liderança autorizada;
- substituir a pessoa escalada por outra integrante da mesma equipe, preservando a solicitação de nova confirmação;
- consultar o histórico auditável de criação, respostas e substituições.

O painel não replica regras de agenda: conflitos, permissões, escopo da equipe e notificações são validados exclusivamente pela API. Ao escolher um evento aprovado, o formulário filtra pela equipe selecionada e preenche seu horário; a escala continua sendo administrada exclusivamente pela Área de Serviço, enquanto o evento apenas a consulta. Na criação em lote, o sistema envia todas as escalas em uma única operação: se uma delas for inválida, nenhuma é criada.

## Minhas escalas e pendências

O item **Minhas escalas** exibe os compromissos da própria pessoa em todas as áreas de serviço. Uma escala pendente pode ser confirmada ou recusada; a recusa aceita motivo opcional e gera o alerta interno para as lideranças responsáveis.

Na visão da Área de Serviço, lideranças autorizadas recebem um resumo das pendências do período filtrado: escalas aguardando confirmação e recusas que exigem substituição. Os cartões aplicam o filtro correspondente sem alterar o escopo validado pela API.

## Agenda institucional

O cadastro de evento permite selecionar, dentro do campus escolhido:

- a célula relacionada, quando houver;
- áreas de serviço e equipes envolvidas;
- espaços reservados, com a validação de conflito mantida na API;
- alertas do evento e, para secretaria ou administração, o bloqueio da agenda do campus.

Ao selecionar um evento na Agenda, o painel apresenta seus vínculos, horários, checklist de preparação e a consulta somente leitura das escalas relacionadas. A pessoa autorizada pode editar o evento, incluir ou concluir itens do checklist, aprovar uma solicitação pendente ou cancelar o evento após confirmação. As ações de alteração, aprovação, cancelamento e permissão continuam sendo validadas exclusivamente pela API; a gestão de pessoas nas escalas permanece exclusivamente na Área de Serviço.

## Notificações

O sino do cabeçalho abre a central de notificações internas. Ela mostra avisos de escala, recusa, substituição e outros fluxos do sistema; ao abrir um aviso não lido, ele é marcado como lido. O mesmo registro interno servirá futuramente como origem para WhatsApp e ProPresenter.

## Cultos — Ordem de Culto

A área de **Cultos** lista os eventos de culto já aprovados na Agenda e permite consultar a ordem correspondente. Para quem possui permissão, o fluxo inicial permite:

- criar uma ordem em branco ou aplicar um modelo ativo da organização;
- acompanhar o status de rascunho ou publicação;
- incluir, editar, reorganizar ou remover itens excepcionais na sequência, como um Teatro Minuto, indicando horário, área envolvida e observações;
- associar materiais e criar demandas para as áreas já envolvidas no culto;
- publicar a ordem quando houver ao menos um item e, depois disso, enviar alerta aos participantes ou baixar seu PDF consolidado.

O painel usa apenas cultos aprovados e não replica as regras de escopo: a autorização para criar, editar, publicar, alertar e gerar PDF é sempre confirmada pela API. A próxima etapa deste módulo é o repertório de louvor e a administração completa dos modelos de ordem de culto.
