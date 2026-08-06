# ADR-0002: Padrão de identidade de autenticação do IBAG One

## Status

Aceito

## Data

06/08/2026

## Contexto

O IBAG One necessita de um modelo de autenticação padronizado, seguro e escalável para todos os usuários da plataforma.

A plataforma será utilizada por diferentes perfis dentro da estrutura da igreja, incluindo:

- Membros
- Integrantes de Área de Serviços
- Líderes
- Supervisores
- Coordenadores
- Pastores
- Secretaria
- Administradores

Cada pessoa cadastrada no sistema poderá receber uma identidade digital própria para acesso aos recursos disponíveis conforme suas permissões.

Durante o planejamento do modelo de autenticação foram consideradas três possibilidades:

1. Utilização do e-mail pessoal do usuário.
2. Utilização de usuário simples sem domínio.
3. Criação de uma identidade institucional utilizando o domínio interno @ibag.one.

## Decisão

O IBAG One utilizará uma identidade institucional própria para autenticação baseada no domínio @ibag.one.

Todo usuário do sistema possuirá um identificador único no formato:

usuario@ibag.one

Exemplos:

joao.silva@ibag.one

maria.oliveira@ibag.one

robson.damiao@ibag.one

O banco de dados armazenará sempre o identificador completo.

O domínio @ibag.one representa uma identidade digital dentro do ecossistema IBAG One e não necessariamente uma caixa postal de e-mail real.

## Regras de negócio

- Todos os usuários utilizarão o padrão @ibag.one.
- Não existirão usuários com formatos mistos.
- O sistema não armazenará usuários apenas como "joao".
- O login oficial sempre será o identificador completo.
- Cada usuário estará vinculado obrigatoriamente a uma Pessoa cadastrada.
- Uma Pessoa poderá possuir no máximo um usuário de acesso.

## Modelo conceitual

A autenticação será separada do cadastro da pessoa.

Pessoa

|

+---- User

     |
     +---- loginEmail

     +---- passwordHash

     +---- permissões

A entidade Person representa a pessoa dentro da organização.

A entidade User representa a identidade de acesso ao sistema.

Essa separação permite que uma pessoa exista no sistema sem necessariamente possuir acesso.

## Facilidade de utilização

Embora o padrão oficial seja:

usuario@ibag.one

O sistema poderá futuramente aceitar atalhos no momento do login.

Exemplo:

Entrada:

joao.silva

Processamento interno:

joao.silva@ibag.one

Essa funcionalidade será apenas uma conveniência de utilização.

Internamente o sistema continuará utilizando o padrão completo.

## Geração de identidade

O IBAG One deverá possuir uma regra automática para geração dos logins.

Exemplo:

Nome:

João da Silva

Sugestão inicial:

joao.silva@ibag.one

Caso exista conflito:

joao.silva2@ibag.one

A criação do identificador deverá garantir unicidade.

## Modelo de dados esperado

O modelo User deverá possuir:

model User {

id String @id @default(uuid())

loginEmail String @unique

passwordHash String

ativo Boolean @default(true)

ultimoLogin DateTime?

personId String @unique

person Person @relation(fields: [personId], references: [id])

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

}

## Consequências positivas

- Padronização da identidade digital dentro do IBAG One.
- Experiência consistente para todos os Campi.
- Facilita gerenciamento de permissões.
- Facilita auditoria de ações realizadas no sistema.
- Permite crescimento futuro da plataforma.
- Possibilita integrações futuras com provedores de identidade externos.
- Evita conflitos de nomes entre usuários.

## Consequências negativas

- Os usuários precisarão utilizar uma identidade diferente do seu e-mail pessoal.
- Será necessário criar regras de geração automática de login.
- Será necessário tratar conflitos de nomes semelhantes.

## Alternativas consideradas

### Utilizar e-mail pessoal

Não adotado.

Motivos:

- Nem todos os membros possuem e-mail.
- O controle da identidade ficaria dependente de serviços externos.
- Dificulta padronização.

### Utilizar apenas usuário sem domínio

Não adotado.

Motivos:

- Possibilidade de conflitos entre Campi.
- Ausência de identidade institucional.
- Dificuldade para integrações futuras.

### Utilizar domínio interno @ibag.one

Adotado.

Motivos:

- Identidade única.
- Padrão profissional.
- Escalável.
- Alinhado à visão do ecossistema digital IBAG One.

## Impacto futuro

Essa decisão influencia diretamente:

- Autenticação JWT.
- Controle de permissões.
- Gestão de usuários.
- Auditoria.
- Recuperação de acesso.
- Integrações futuras.
- Aplicativos mobile e web.

## Próximos passos

1. Adicionar campo loginEmail ao modelo User.
2. Criar migration correspondente.
3. Implementar serviço de criação de usuários.
4. Implementar geração automática da identidade @ibag.one.
5. Implementar autenticação utilizando JWT.
6. Criar sistema de permissões baseado nos papéis da organização.
