# 👥 Domínio: Pessoa

## Contexto

A entidade **Pessoa** representa qualquer indivíduo que possui uma história dentro da IBAG.

O IBAG One não deve tratar pessoas como simples registros de cadastro, mas como indivíduos acompanhados ao longo de uma jornada de relacionamento, cuidado e discipulado.

Uma pessoa possui:

- identidade;
- história;
- relacionamentos;
- participação na igreja;
- vínculos com células;
- atuação em ministérios;
- histórico de mudanças.

---

# 🎯 Objetivo

O domínio Pessoa deve permitir que a igreja acompanhe:

- quem é a pessoa;
- como ela chegou à igreja;
- qual foi sua decisão;
- seu processo de integração;
- sua caminhada dentro da igreja;
- sua participação em células;
- sua atuação em ministérios;
- seu histórico ao longo dos anos.

---

# 🧭 Jornada da Pessoa

A entrada de uma pessoa na IBAG acontece através de uma jornada.

Fluxo inicial:

```
Visitante

↓

Cartão de decisão

↓

Equipe Consolidação

↓

Secretaria

↓

Pessoa cadastrada

↓

Célula

↓

Ministério / Liderança
```

---

# 📝 Visitante

O IBAG One não terá como objetivo controlar todos os visitantes da igreja.

Uma visita eventual não necessariamente gera um cadastro permanente.

O controle oficial inicia quando existe uma decisão de seguir uma caminhada dentro da igreja.

Exemplos:

- Aceitou Jesus;
- Deseja se tornar membro;
- Deseja realizar batismo;
- Veio de outra igreja.

---

# ✝️ Cartão de Decisão

O cartão de decisão representa o primeiro registro oficial da jornada.

Informações iniciais:

- Nome;
- Telefone;
- Campus;
- Data da decisão;
- Como conheceu a IBAG;
- Tipo de decisão.

---

# 🤝 Equipe Consolidação

A equipe Consolidação é responsável pelo primeiro contato de cuidado.

Responsabilidades:

- auxiliar no preenchimento do cartão de decisão;
- acolher a pessoa;
- iniciar relacionamento;
- encaminhar informações para continuidade do processo.

---

# 🗂️ Secretaria

A Secretaria é responsável pelo acompanhamento administrativo inicial.

Responsabilidades:

- realizar contato;
- atualizar cadastro;
- acompanhar informações;
- auxiliar no processo de integração.

---

# 👤 Cadastro da Pessoa

O cadastro deve seguir o princípio de evolução progressiva.

A pessoa não precisa possuir todas as informações no primeiro momento.

O sistema deve permitir completar informações ao longo da caminhada.

---

## Dados essenciais

Informações iniciais:

- Nome;
- Telefone;
- Campus;
- Data de entrada;
- Origem;
- Responsável pelo acompanhamento.

---

## Dados complementares

Informações adicionais:

- Data de nascimento;
- Endereço;
- Foto;
- Estado civil;
- Documentos;
- Informações familiares.

---

# 🏠 Família

Família é um relacionamento importante dentro do domínio Pessoa.

Uma pessoa pode possuir vínculos familiares.

Exemplo:

```
Família Oliveira

José
├── esposo de Ana

Ana
├── esposa de José

Pedro
├── filho de José e Ana
```

---

O relacionamento familiar deve ser flexível.

Não deve existir apenas:

- esposo;
- esposa.

Deve permitir:

- pai;
- mãe;
- filho;
- responsável;
- outros vínculos.

---

# ⛪ Campus

Toda pessoa pertence a um Campus atual.

O Campus representa uma comunidade local da IBAG.

Cada Campus está associado a uma cidade.

---

# 🏠 Célula

Toda pessoa deve pertencer a uma única célula quando estiver integrada à visão da igreja.

Porém, uma pessoa pode existir no sistema sem célula inicialmente.

A célula atual representa:

- acompanhamento;
- cuidado;
- relacionamento.

---

# 🔄 Histórico

O histórico da pessoa nunca deve ser perdido.

Alterações importantes devem gerar registros históricos.

Exemplos:

## Mudança de célula

```
2026

Célula Rosa 01

↓

2028

Célula Azul 03
```

---

## Mudança de Campus

Quando uma pessoa muda de Campus:

- mantém seu histórico;
- encerra vínculo anterior;
- inicia novo vínculo.

Exemplo:

```
Campus Cachoeirinha

↓

Campus Esteio
```

---

# 🎵 Ministérios

Uma pessoa pode servir em múltiplos ministérios.

Exemplo:

```
João

Célula:
Azul 02

Ministérios:

- Louvor
- Recepção
```

O vínculo com ministérios não substitui o vínculo com a célula.

---

# 🔐 Permissões

O acesso às informações deve respeitar responsabilidades.

Exemplo inicial:

## Pastor

Visão ampla da igreja.

## Supervisor

Visão das suas redes e células.

## Líder

Visão da sua célula.

## Secretaria

Acesso administrativo.

---

As permissões devem ser evolutivas e configuráveis.

---

# 📌 Regras de Negócio

## Regra 01

Uma pessoa possui uma única célula atual.

---

## Regra 02

Uma pessoa pode servir em vários ministérios.

---

## Regra 03

Uma pessoa pode mudar de célula mantendo histórico.

---

## Regra 04

Uma pessoa pode mudar de Campus mantendo histórico.

---

## Regra 05

Uma pessoa pode sair da igreja e retornar futuramente.

O histórico deve permanecer.

---

# 🏛️ Princípio do Domínio

O IBAG One não é um sistema de cadastro.

É um sistema de história e cuidado.

Cada pessoa possui uma jornada que deve ser acompanhada ao longo do tempo.
