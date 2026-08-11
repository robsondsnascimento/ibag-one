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

## Entrada e formação

Na visão de uma área, lideranças autorizadas acessam **Entrada e formação** para:

- configurar as etapas, indicando quais são obrigatórias;
- registrar o interesse de uma pessoa, com equipe desejada opcional;
- iniciar o acompanhamento;
- concluir cada etapa;
- aprovar a pessoa para uma equipe após cumprir as etapas obrigatórias.

A aprovação cria a membresia de integrante na equipe em uma única operação. Processos aprovados, recusados ou encerrados por desistência continuam visíveis como histórico. A liderança geral também pode editar, ativar/desativar e reorganizar as etapas ativas; uma etapa desativada deixa de ser exigida nos novos acompanhamentos. As escalas continuam em seu fluxo próprio.
