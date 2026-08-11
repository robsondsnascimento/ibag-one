# Painel administrativo

## Áreas de Serviço

O menu lateral agrupa as áreas cadastradas abaixo de **Áreas de Serviço**. O grupo pode ser recolhido e expandido; cada área abre seu próprio espaço no painel.

A visão da área selecionada consulta `GET /service-areas/:id` e apresenta, respeitando a organização autenticada:

- escopo global ou de campus;
- equipes ativas e seus campi;
- liderança geral, liderança de campus e liderança de equipe;
- integrantes ativos, equipe e data inicial do vínculo.

Essa primeira visão é de acompanhamento. A gestão de equipes, vínculos, processo de entrada e escalas continuará sendo adicionada em etapas, usando as permissões e os endpoints já definidos para cada liderança.
