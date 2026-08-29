# Painel administrativo

## Pessoas

Depois de criar uma pessoa, o painel abre seu cadastro automaticamente. Além dos dados básicos, a seção **Acesso e serviço** permite decidir, de forma independente e opcional, se ela receberá login ou se atua em uma Área de Serviço:

- definir um campus principal e marcar os demais **Campus** em que a mesma pessoa pode atuar, sem gerar cadastro ou login duplicado;
- ativar ou inativar o cadastro da pessoa; a inativação preserva seu histórico, retira a pessoa das listagens operacionais e bloqueia seu acesso ao sistema, caso tenha login;
- informar a data de ingresso na IBAG no cadastro da pessoa; quando o dia for desconhecido, o cadastro aceita apenas mês e ano e essa precisão é preservada na exibição de **Pessoas em serviço**, sem reutilizar a data de criação do vínculo de equipe;
- informar se a pessoa receberá login no IBAG One e definir a senha inicial; a ação fica restrita a administração e super administração;
- adicionar ou alterar uma foto de perfil em JPG, PNG ou WEBP de até 3 MB; a própria pessoa acessa **Meu perfil** pela lateral para atualizar apenas sua foto, e a gestão central também pode fazê-lo no cadastro;
- mostrar a foto de perfil na listagem de pessoas sempre que ela existir; enquanto não houver foto, o painel mantém as iniciais como identificação visual;
- na visualização semanal ou diária da agenda, o cartão de cada evento cresce conforme necessário para exibir horário, título e campus sem cortar o texto;
- mostrar ou ocultar a senha enquanto ela é digitada, tanto no login quanto na definição da senha inicial;
- abrir, pelo cartão do usuário na lateral, um menu com configurações do perfil, alteração da própria senha, consulta do perfil de acesso, notificações, alternância de aparência, suporte e saída da conta;
- preservar no navegador o último tema escolhido pela pessoa, inclusive após atualizar ou reabrir o painel;
- visualizar o usuário institucional que foi gerado;
- adicionar, consultar e remover títulos ministeriais, como `Pastor de Adoração`, sem alterar automaticamente o login ou as permissões;
- escolher uma Área de Serviço, sua equipe e funções de serviço, criando o vínculo de integrante diretamente no cadastro;
- consultar os vínculos ativos já existentes da pessoa, editar suas funções ou transferi-la para outra Área de Serviço e equipe; a transferência encerra o vínculo anterior para preservar o histórico.

A equipe é obrigatória para o vínculo de integrante, pois ela define o campus e o escopo das escalas. A API confirma a permissão de quem faz a vinculação e impede duplicidade de vínculos ativos.

O cadastro aberto da pessoa possui rolagem interna quando seu conteúdo ultrapassa a altura disponível da tela, mantendo acessíveis os campos de acesso, campi e vínculo de serviço.

No modo painel, o cadastro usa duas colunas: dados pessoais à esquerda e **Acesso e serviço** à direita. Em telas menores, o layout retorna a uma única coluna para preservar a legibilidade e o toque.

## Áreas de Serviço

O menu lateral mantém **Agenda**, **Ordem de Culto** e **IBAG Kids** como itens diretos no nível de Organização. As áreas técnicas de Ordem de Culto e IBAG Kids não são exibidas no submenu de **Áreas de Serviço**; seus acessos operacionais usam os itens diretos. As demais áreas cadastradas ficam agrupadas abaixo de **Áreas de Serviço**. Os grupos de Células e Áreas de Serviço iniciam recolhidos e alternam entre expandir e recolher ao clicar no próprio título ou no ícone de seta, sem alterar o estado do outro grupo. Em telas menores, os submenus são exibidos em um painel rolável na lateral esquerda, para que todos os itens permaneçam acessíveis.

A visão da área selecionada consulta `GET /service-areas/:id` e apresenta, respeitando a organização autenticada:

- escopo global ou de campus;
- equipes ativas e seus campi;
- árvore de cuidado da Área, iniciando em Pastor Sênior e Pastores ativos, seguindo por liderança geral, liderança de campus, liderança de equipe e voluntários de cada equipe;
- integrantes ativos, equipe, funções de serviço e data de ingresso na IBAG, quando informada.

Na árvore de cuidado, cada nível da hierarquia possui um botão azul expansível. O clique revela ou recolhe as pessoas vinculadas àquela função; quando não há atribuição, a mensagem correspondente é exibida após a expansão.

Pessoas com permissão de gestão veem ações conforme seu vínculo na área:

- secretaria, administração e super administração gerenciam equipes e vínculos;
- liderança geral também pode criar equipes;
- lideranças da área podem vincular pessoas dentro do escopo que a API autoriza.

O painel já permite criar equipes e vincular uma pessoa como integrante, liderança de equipe, liderança de campus ou liderança geral. No vínculo, a busca por pessoa usa pesquisa com autocomplete por nome, contato ou telefone. A API permanece responsável pela validação final de escopo, campus, equipe e permissão.

Secretaria, administração e super administração também veem **Configurar área**, onde podem editar nome e descrição e ativar/inativar a área. A inativação da área interrompe suas equipes ativas, mas não remove pessoas, escalas ou histórico. Ao reativar uma área, cada equipe permanece inativa até ser reativada manualmente. As lideranças autorizadas veem **Gerenciar** em suas equipes para editar nome e descrição ou alterar o status da própria equipe. O campus da equipe e o escopo da área permanecem informativos e não podem ser mudados nessa tela.

Áreas inativas aparecem identificadas no submenu apenas para a gestão central, permitindo sua reativação sem expô-las às operações diárias. Dentro da área, cada equipe mostra claramente se está ativa ou inativa.

## Funções de escala e operacionais

Cada Área de Serviço possui uma seção **Funções de escala**, onde a gestão central cadastra, remove e padroniza as funções que podem ser atribuídas a pessoas e usadas nas escalas. As funções existentes em vínculos antigos permanecem preservadas, mesmo que sejam removidas do catálogo para novos vínculos.

A Área de Serviço **Música** apresenta uma seção de **Funções operacionais** por equipe. Ela mostra os **Ministros de Louvor** cadastrados nas funções de serviço de cada integrante. A liderança autorizada marca ou remove `Ministro` diretamente no cadastro da pessoa; a função permanece limitada à equipe escolhida e habilita o fluxo de repertório de cultos quando houver escala confirmada.

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
- criar uma escala individual ou em lote para pessoas com vínculo ativo na mesma equipe, escolhendo em calendário mensal um Culto aprovado do campus da equipe ou informando uma data e horário independentes;
- visualizar a função, a pessoa, a equipe, o evento relacionado quando existir e observações;
- confirmar ou recusar a própria escala, com motivo opcional na recusa;
- concluir ou reabrir uma escala pela liderança autorizada;
- substituir a pessoa escalada por outra integrante da mesma equipe, preservando a solicitação de nova confirmação;
- remover uma pessoa de uma escala ainda não concluída, após confirmação, preservando a alteração no histórico;
- escrever, alterar ou limpar a observação geral de cada culto/data diretamente na linha **Observações**, abaixo das funções da grade;
- consultar o histórico auditável de criação, respostas e substituições;
- cadastrar as funções de cada integrante da equipe a partir do catálogo da Área de Serviço; uma mesma pessoa pode marcar quantas funções exercer. Marcar Ministro na Área de Música também habilita o fluxo de repertório.

O painel não replica regras de agenda: conflitos, permissões, escopo da equipe e notificações são validados exclusivamente pela API. Ao escolher um Culto no calendário, o formulário preenche sua data e horário; se a escala for criada sem Culto, ela poderá ser vinculada automaticamente quando houver um Culto aprovado no mesmo campus e horário. A escala continua sendo administrada exclusivamente pela Área de Serviço, enquanto o evento apenas a consulta. Na criação em lote, o sistema envia todas as escalas em uma única operação: se uma delas for inválida, nenhuma é criada.

Na Área de Música, a visualização padrão é a **Grade da Escala do Louvor**, inspirada na planilha operacional já utilizada pela igreja. A grade trabalha com o mês completo, escolhido em um seletor próprio, e permite mostrar todos os Campus ou apenas um Campus específico. Cada campus possui seu próprio quadro, com todos os cultos aprovados do mês nas colunas — inclusive os ainda sem escala —, funções nas linhas, pessoas escaladas nas células e a linha **Observações** sempre posicionada abaixo das funções. As cores indicam o estado de confirmação. Todo integrante ativo do Louvor pode consultar a grade das próprias equipes, mas a edição continua exclusiva da liderança autorizada. Lideranças autorizadas podem clicar diretamente em uma célula de função para adicionar outra pessoa, substituir ou remover alguém já escalado; o editor de pessoas não contém campo de observação. O texto livre é escrito diretamente na célula correspondente da linha **Observações**, sem borda ou botão de ação, e é salvo automaticamente ao sair da célula; apagar o conteúdo e sair da célula remove a observação. O texto pertence ao culto/data e ao Campus e permanece independente das pessoas escaladas. O sistema mantém a equipe original na substituição e vincula automaticamente à pessoa a função indicada pela linha antes de criar a escala. A linha consolidada de **Indisponibilidade**, com os nomes, aparece somente para a liderança dentro do seu escopo. O participante comum usa o quadro **Indisponibilidade para servir**, onde marca ou retira somente as datas em que não poderá servir, sem visualizar a situação de outras pessoas; o backend impede que ele seja incluído em nova escala ou troca naquela data. O botão **Lista** retorna à visualização operacional completa, onde permanecem as ações de confirmar, recusar, concluir, substituir, remover e consultar histórico.

## Minhas escalas e pendências

O item **Minhas escalas** exibe os compromissos da própria pessoa em todas as áreas de serviço. Uma escala pendente pode ser confirmada ou recusada; a recusa aceita motivo opcional e gera o alerta interno para as lideranças responsáveis.

Para uma escala futura de Louvor, a pessoa também encontra **Solicitar troca**. O formulário consulta somente integrantes ativos da mesma equipe que possuam a mesma função cadastrada e não tenham conflito de agenda. A solicitação não muda a escala imediatamente: ela aparece no painel da liderança da equipe, que pode aprovar ou recusar. Na aprovação, a nova pessoa é escalada e recebe uma nova solicitação de confirmação.

Na visão da Área de Serviço, lideranças autorizadas recebem um resumo das pendências do período filtrado: escalas aguardando confirmação e recusas que exigem substituição. Logo abaixo, há uma lista de solicitações de troca pendentes com as ações **Aprovar** e **Recusar**. Os cartões e decisões aplicam o escopo validado pela API.

## Agenda institucional

O cadastro de evento permite selecionar, dentro do campus escolhido:

- a célula relacionada, quando houver, exceto em eventos do tipo **Culto**;
- áreas de serviço envolvidas;
- espaços reservados, com a validação de conflito mantida na API;
- alertas do evento e, para secretaria ou administração, o bloqueio da agenda do campus.

Na criação, o formulário também pergunta se o evento é recorrente. É possível escolher **uma vez por semana** ou **uma vez por mês** e informar até quando a série deve existir. Em uma série aprovada de Cultos, cada ocorrência recebe automaticamente sua própria ordem baseada no modelo padrão, desde que o evento contenha todas as áreas exigidas pelo modelo. A agenda do painel inicia na **segunda-feira** e eventos de domingo são posicionados corretamente na última coluna da semana. No topo da Agenda, os atalhos **Hoje**, **Esta semana** e **Este mês** retornam ao período atual e alternam entre a visão diária, semanal e mensal; as setas navegam de acordo com a visualização ativa.

Os vínculos diretos de equipe não são exibidos no cadastro nem nos detalhes do evento. As escalas continuam pertencendo exclusivamente à Área de Serviço e podem apontar para o evento correspondente. Ao selecionar um evento na Agenda, o painel apresenta áreas, espaços, horários, checklist de preparação e a consulta somente leitura das escalas relacionadas. A pessoa autorizada pode editar o evento, incluir ou concluir itens do checklist, aprovar uma solicitação pendente ou cancelar o evento após confirmação. As ações de alteração, aprovação, cancelamento e permissão continuam sendo validadas exclusivamente pela API; a gestão de pessoas nas escalas permanece exclusivamente na Área de Serviço.

## Notificações

O sino do cabeçalho abre a central de notificações internas. Ela mostra avisos de escala, recusa, substituição e outros fluxos do sistema; ao abrir um aviso não lido, ele é marcado como lido. O mesmo registro interno servirá futuramente como origem para WhatsApp e ProPresenter.

## Cultos — Ordem de Culto

A área de **Cultos** lista os eventos de culto já aprovados na Agenda e permite consultar a ordem correspondente. Para quem possui permissão, o fluxo inicial permite:

- criar uma ordem em branco ou aplicar um modelo ativo da organização;
- acompanhar o status de rascunho ou publicação;
- acompanhar a sequência em um checklist visual ampliado; no rascunho, incluir um item excepcional, como Teatro Minuto, ou selecionar uma das cinco posições padrão de música;
- incluir, editar, reorganizar ou remover itens excepcionais na sequência, indicando horário, área envolvida, pessoa responsável e observações; ao escolher uma área na inclusão, o painel cria a solicitação para ela e avisa sua liderança; os momentos de música são vinculados automaticamente à Área de Música; ao remover, avisa a mesma área;
- associar materiais e criar demandas para as áreas já envolvidas no culto, escolhendo responsável por busca/autopreenchimento quando necessário;
- acompanhar demandas com área, responsável, prazo e status, concluindo ou cancelando conforme a autorização da API; consultar a escala do culto sem editar seus vínculos;
- editar os modelos, movendo, alterando ou removendo seus itens;
- publicar a ordem quando houver ao menos um item e, depois disso, enviar alerta aos participantes ou baixar seu PDF consolidado.

O painel usa apenas cultos aprovados e não replica as regras de escopo: a autorização para criar, editar, publicar, alertar e gerar PDF é sempre confirmada pela API.

## Cultos — Repertório de Louvor

Dentro do culto selecionado, o painel apresenta o repertório de cada área envolvida. O Ministro de Louvor pode criar o rascunho com a primeira música, acrescentar outras e enviar para aprovação. A liderança responsável aprova ou devolve com orientação; após a aprovação, pode encaminhar as músicas ao item de Louvor da Ordem de Culto e indicar a área que preparará os materiais. Selecionar uma posição musical no checklist apenas cria o lugar da música na sequência; a canção continua dependendo desse fluxo de repertório e aprovação.

Para o Culto de Cachoeirinha, o formulário apresenta cinco momentos de música: Música celebração, Música celebração ou POP, Música oração, Música dízimos e ofertas e Música final. Cada música pode indicar seu momento e o **link da versão no YouTube**, registrado como referência do repertório e preservado quando ele é enviado à Ordem de Culto.

Em **Modelos**, a liderança central pode criar o roteiro Cachoeirinha com as cinco posições, escolhendo a Área de Música global. Ao encaminhar um repertório aprovado, o painel usa essas posições automaticamente conforme o momento escolhido em cada música; para uma ordem diferente, a liderança ainda pode selecionar manualmente o item de Louvor de destino.

O painel também apresenta o prazo calculado e o aviso visual de envio em atraso. As permissões de Ministro, liderança musical, escala confirmada, área de Música e item de Louvor continuam confirmadas exclusivamente pela API.
