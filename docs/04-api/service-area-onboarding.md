# API: Entrada e Formação em Áreas de Serviço

## Objetivo

Cada área de serviço possui um processo próprio de entrada. A área de Música, por exemplo, pode exigir audição, avaliação e treinamento; uma equipe de recepção pode exigir somente treinamento e acompanhamento.

O processo não torna ninguém integrante automaticamente. A entrada na equipe ocorre somente após aprovação da liderança e cumprimento das etapas obrigatórias ativas.

## Estados do processo

| Status | Significado |
| --- | --- |
| `INTERESTED` | A pessoa manifestou interesse ou foi incluída pela liderança. |
| `IN_PROGRESS` | A liderança iniciou o acompanhamento e as etapas podem ser comprovadas. |
| `APPROVED` | A pessoa foi aprovada e se tornou integrante da equipe escolhida. |
| `REJECTED` | A entrada foi recusada, preservando o motivo. |
| `WITHDRAWN` | A pessoa ou a liderança encerrou o processo sem aprovação. |

## Configuração das etapas

A secretaria, administração, super administração ou liderança geral da área configura as etapas. Elas permanecem ordenadas e podem ser obrigatórias ou opcionais.

```json
POST /service-area-onboarding/areas/:areaId/stages
{
  "nome": "Audição",
  "descricao": "Avaliação técnica e espiritual do candidato.",
  "obrigatoria": true
}
```

Rotas disponíveis:

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/service-area-onboarding/areas/:areaId/stages` | Lista as etapas ativas da área. |
| `POST` | `/service-area-onboarding/areas/:areaId/stages` | Cria uma etapa no fim do processo. |
| `PATCH` | `/service-area-onboarding/stages/:id` | Edita ou desativa uma etapa. |
| `PATCH` | `/service-area-onboarding/areas/:areaId/stages/reorder` | Define a nova ordem de todas as etapas. |

```json
PATCH /service-area-onboarding/areas/:areaId/stages/reorder
{
  "stageIds": ["uuid-etapa-1", "uuid-etapa-2", "uuid-etapa-3"]
}
```

## Manifestação de interesse

A própria pessoa pode iniciar o processo para si. A liderança também pode criar o processo para uma pessoa da sua área de responsabilidade.

```json
POST /service-area-onboarding/applications
{
  "serviceAreaId": "uuid-da-area",
  "desiredTeamId": "uuid-da-equipe-opcional",
  "observacao": "Tenho interesse em servir aos domingos."
}
```

Uma pessoa não pode manter dois processos abertos na mesma área nem iniciar um processo enquanto já possui vínculo ativo nessa área.

## Acompanhamento e aprovação

Lideranças autorizadas iniciam o processo, registram a conclusão de cada etapa e aprovam a pessoa para uma equipe específica.

```text
PATCH /service-area-onboarding/applications/:applicationId/start
POST  /service-area-onboarding/applications/:applicationId/stages/:stageId/complete
```

```json
POST /service-area-onboarding/applications/:applicationId/stages/:stageId/complete
{
  "observacao": "Participou e foi aprovado no treinamento de integração."
}
```

```json
PATCH /service-area-onboarding/applications/:applicationId/approve
{
  "teamId": "uuid-da-equipe"
}
```

A aprovação exige todas as etapas obrigatórias ativas concluídas. Em uma única operação, o processo muda para `APPROVED` e é criado o vínculo ativo de integrante na equipe, com o campus correspondente.

## Encerramento sem aprovação

```json
PATCH /service-area-onboarding/applications/:applicationId/reject
{
  "motivo": "Ainda não concluiu a formação necessária para esta área."
}
```

```json
PATCH /service-area-onboarding/applications/:applicationId/withdraw
{
  "motivo": "A pessoa preferiu aguardar um novo momento."
}
```

## Consultas e permissões

| Método | Rota | Acesso |
| --- | --- | --- |
| `GET` | `/service-area-onboarding/applications/me` | Processos da própria pessoa. |
| `GET` | `/service-area-onboarding/applications/:id` | Pessoa participante ou liderança autorizada. |
| `GET` | `/service-area-onboarding/areas/:areaId/applications?status` | Liderança autorizada da área. |

A liderança geral visualiza e administra toda a área. Lideranças de campus e de equipe administram apenas os processos vinculados ao seu escopo. A configuração das etapas é exclusiva da liderança geral da área e da administração central.
