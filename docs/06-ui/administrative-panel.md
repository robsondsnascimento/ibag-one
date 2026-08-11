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
- consultar o histórico auditável de criação, respostas e substituições;
- cadastrar as funções de cada integrante da equipe, como Guitarra, Baixo ou Vocal.

O painel não replica regras de agenda: conflitos, permissões, escopo da equipe e notificações são validados exclusivamente pela API. Ao escolher um evento aprovado, o formulário filtra pela equipe selecionada e preenche seu horário; a escala continua sendo administrada exclusivamente pela Área de Serviço, enquanto o evento apenas a consulta. Na criação em lote, o sistema envia todas as escalas em uma única operação: se uma delas for inválida, nenhuma é criada.

## Minhas escalas e pendências

O item **Minhas escalas** exibe os compromissos da própria pessoa em todas as áreas de serviço. Uma escala pendente pode ser confirmada ou recusada; a recusa aceita motivo opcional e gera o alerta interno para as lideranças responsáveis.

Para uma escala futura de Louvor, a pessoa também encontra **Solicitar troca**. O formulário consulta somente integrantes ativos da mesma equipe que possuam a mesma função cadastrada e não tenham conflito de agenda. A solicitação não muda a escala imediatamente: ela aparece no painel da liderança da equipe, que pode aprovar ou recusar. Na aprovação, a nova pessoa é escalada e recebe uma nova solicitação de confirmação.

Na visão da Área de Serviço, lideranças autorizadas recebem um resumo das pendências do período filtrado: escalas aguardando confirmação e recusas que exigem substituição. Logo abaixo, há uma lista de solicitações de troca pendentes com as ações **Aprovar** e **Recusar**. Os cartões e decisões aplicam o escopo validado pela API.

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
- incluir, editar, reorganizar ou remover itens excepcionais na sequência, como um Teatro Minuto, indicando horário, área envolvida e observações; ao escolher uma área na inclusão, o painel cria a solicitação para ela e avisa sua liderança; ao remover, avisa a mesma área;
- associar materiais e criar demandas para as áreas já envolvidas no culto;
- publicar a ordem quando houver ao menos um item e, depois disso, enviar alerta aos participantes ou baixar seu PDF consolidado.

O painel usa apenas cultos aprovados e não replica as regras de escopo: a autorização para criar, editar, publicar, alertar e gerar PDF é sempre confirmada pela API.

## Cultos — Repertório de Louvor

Dentro do culto selecionado, o painel apresenta o repertório de cada área envolvida. O Ministro de Louvor pode criar o rascunho com a primeira música, acrescentar outras e enviar para aprovação. A liderança responsável aprova ou devolve com orientação; após a aprovação, pode encaminhar as músicas ao item de Louvor da Ordem de Culto e indicar a área que preparará os materiais.

Para o Culto de Cachoeirinha, o formulário apresenta o roteiro padrão: Celebração de início, Celebração ou POP, Oração, Dízimos e ofertas e Celebração final. Cada música pode indicar seu momento e o **link da versão no YouTube**, registrado como referência do repertório e preservado quando ele é enviado à Ordem de Culto.

Em **Modelos**, a liderança central pode criar o roteiro Cachoeirinha com essas cinco posições, escolhendo a Área de Música global. Ao encaminhar um repertório aprovado, o painel usa essas posições automaticamente conforme o momento escolhido em cada música; para uma ordem diferente, a liderança ainda pode selecionar manualmente o item de Louvor de destino.

O painel também apresenta o prazo calculado e o aviso visual de envio em atraso. As permissões de Ministro, liderança musical, escala confirmada, área de Música e item de Louvor continuam confirmadas exclusivamente pela API.
