# Integrações

## Situação atual

O IBAG One opera localmente com NestJS, PostgreSQL e Prisma. Arquivos de estudo semanal e outros anexos de desenvolvimento são armazenados localmente.

As notificações são persistidas internamente. Isso permite validar os fluxos de escalas, Kids, Ordem de Culto e repertório antes de habilitar canais externos.

## Integrações previstas e autorizadas

### WhatsApp

Será o canal de comunicação com pessoas, equipes e participantes de cultos. A implementação dependerá de provedor oficial, credenciais, modelos de mensagem e definição do ambiente de produção.

### ProPresenter

Será usado apenas nos fluxos relacionados aos cultos. A implementação dependerá da versão utilizada, conexão com a máquina/servidor de apresentação e autorização operacional.

## Fora do escopo atual

- E-mail transacional.
- Integrações externas sem credenciais aprovadas.
- Sincronização automática com ferramentas não autorizadas.

## Requisito antes de produção

Nenhuma integração externa deve ser ativada sem variáveis de ambiente próprias, armazenamento seguro de segredos, registro de tentativas de entrega e homologação da IBAG.
