# Notificações externas: WhatsApp e ProPresenter

O IBAG One mantém a notificação interna como registro central. Os canais externos são opcionais e ficam desligados enquanto não houver configuração.

## Canais suportados

- WhatsApp: `WHATSAPP_WEBHOOK_URL` e, se necessário, `WHATSAPP_WEBHOOK_TOKEN`.
- ProPresenter: `PROPRESENTER_WEBHOOK_URL` e, se necessário, `PROPRESENTER_WEBHOOK_TOKEN`.

Os endpoints recebem uma requisição `POST` JSON com este contrato:

```json
{
  "channel": "WHATSAPP",
  "notificationId": "uuid",
  "organizationId": "uuid",
  "title": "Ordem de Culto publicada",
  "message": "Confira suas responsabilidades.",
  "recipientPersonIds": ["uuid"],
  "eventId": "uuid"
}
```

O conector externo é responsável por resolver os identificadores de pessoa e aplicar as regras do provedor, inclusive opt-in e telefone válido para WhatsApp.

## Comportamento seguro

- Sem URL configurada, o canal retorna como desligado e não há tráfego externo.
- Cada webhook tem prazo máximo de cinco segundos.
- Uma falha externa é registrada tecnicamente, mas nunca desfaz a notificação interna nem a operação ministerial.
- Tokens são enviados somente no cabeçalho `Authorization: Bearer` e nunca devem constar em commits ou logs.

O disparo externo está conectado ao envio de notificações pela API e aos alertas manuais da Ordem de Culto. Outros fluxos internos continuam preservados e podem ser conectados ao mesmo serviço sem mudar o contrato dos adaptadores.

## Ativação

1. Criar ou contratar o conector de WhatsApp/ProPresenter que aceite o contrato acima.
2. Configurar URLs e tokens exclusivamente no ambiente de homologção.
3. Disparar um alerta de Ordem de Culto de teste.
4. Conferir a notificação interna, o recebimento no conector e os logs técnicos.
5. Repetir com a configuração de produção e uma lista de destinatários autorizada.
