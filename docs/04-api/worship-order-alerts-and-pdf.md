# API: Alertas e PDF da Ordem de Culto

## Quando usar

Depois de publicar a ordem de culto, a liderança responsável pode comunicar todos os participantes e baixar a versão consolidada em PDF.

## Destinatários do alerta

O sistema reúne e remove duplicidades entre:

- integrantes ativos das áreas de serviço vinculadas ao culto;
- pessoas escaladas para o evento;
- pessoa responsável pelo evento;
- responsáveis indicados nos itens e nas pendências da ordem.

Somente pessoas ativas na organização recebem a notificação interna.

## Regras

- Alerta e PDF exigem uma ordem `PUBLISHED`.
- Apenas quem já pode administrar a ordem do culto pode enviar o alerta ou gerar o PDF: liderança responsável pelo evento, criador do evento, `WORSHIP_ORDER_MANAGER`, `SECRETARY`, `ADMIN`, `SUPER_ADMIN` ou `PASTOR`.
- O PDF é gerado sob demanda; ele não cria uma cópia permanente no servidor.
- O documento reúne dados do culto, sequência dos itens, responsáveis, materiais, pendências e as escalas apenas para consulta.

## Enviar alerta

```json
POST /worship-orders/uuid-da-ordem/alert
{
  "titulo": "Ordem de culto publicada",
  "mensagem": "A ordem está disponível. Confira sua escala, materiais e pendências."
}
```

## Baixar PDF

```http
GET /worship-orders/uuid-da-ordem/pdf
```

A resposta é um arquivo `application/pdf` para download.
