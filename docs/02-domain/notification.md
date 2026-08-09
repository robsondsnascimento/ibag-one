# Domínio: Comunicação e Notificação

## Estado atual

O backend registra notificações internas com título, mensagem, organização, público e destinatários. Elas formam a trilha de auditoria para comunicações operacionais.

Públicos suportados:

- organização;
- campus;
- área de serviço;
- equipe;
- pessoa específica.

## Origens já utilizadas

- criação, recusa e substituição de escalas;
- fluxo de repertório;
- publicação e alerta da Ordem de Culto;
- operações do IBAG Kids.

## Canais autorizados

As futuras entregas externas ficam limitadas a:

1. WhatsApp;
2. ProPresenter.

E-mail não faz parte do escopo atual. Nenhuma credencial ou chamada externa está configurada no backend neste momento.

## Princípio de integração

O registro interno é a fonte de verdade. Um conector futuro poderá entregar uma notificação já registrada ao WhatsApp ou ProPresenter, guardando o resultado da entrega sem perder o histórico operacional.

## Permissões

O direito de iniciar uma comunicação acompanha o domínio de origem: liderança de equipe administra suas escalas, responsáveis de Ordem de Culto enviam seus alertas e funções operacionais do Kids atuam apenas dentro do seu escopo.
