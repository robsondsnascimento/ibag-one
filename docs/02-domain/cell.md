# 🏠 Domínio: Célula

## Contexto

O domínio **Célula** representa o principal ambiente de cuidado, relacionamento e discipulado da IBAG.

A célula é onde a igreja acompanha pessoas de forma próxima, desenvolvendo relacionamentos, formando discípulos e levantando novos líderes.

A célula não representa apenas uma reunião, mas uma estrutura viva de cuidado pastoral.

---

# 🎯 Objetivo

O domínio Célula deve permitir acompanhar:

- células existentes;
- localização;
- liderança;
- redes;
- supervisão;
- participantes;
- visitantes;
- multiplicações;
- histórico;
- saúde da célula.

---

# 🏛️ Estrutura Hierárquica

A estrutura de cuidado das células segue:

```
Pastor

↓

Coordenador de Células

↓

Supervisor

↓

Rede

↓

Célula

↓

Pessoas
```

---

# ⛪ Relação com Campus

Toda célula pertence a um Campus.

Modelo:

```
IBAG

|

Campus

|

Redes

|

Células
```

Uma rede não atravessa Campi.

Cada Campus possui suas próprias redes e células.

---

# 🌎 Rede

A Rede é uma organização interna das células dentro de um Campus.

Exemplo:

```
Campus Cachoeirinha

├── Rede Rosa
│
├── Rede Azul
│
└── Rede Verde
```

Outro Campus pode possuir redes com os mesmos nomes, porém são entidades diferentes.

---

# 🌱 Nascimento de uma Célula

Uma nova célula normalmente nasce através de uma multiplicação.

Fluxo:

```
Célula saudável

↓

Preparação de liderança

↓

Multiplicação

↓

Nova célula

↓

Novo líder

↓

Novo acompanhamento
```

Uma nova célula pode iniciar sem Líder em Treinamento.

---

# 👥 Estrutura interna da Célula

Uma célula possui funções específicas:

```
Célula

├── Líder
│
├── Líder em Treinamento (LT)
│
├── Anfitrião
│
└── Participantes
```

---

# 👤 Líder de Célula

Responsável pelo cuidado direto das pessoas.

Responsabilidades:

- conduzir a célula;
- acompanhar participantes;
- desenvolver novos líderes;
- manter comunicação com supervisão.

---

# 🌱 Líder em Treinamento (LT)

O LT representa o desenvolvimento de novas lideranças.

Características:

- não é obrigatório no início da célula;
- demonstra maturidade da célula;
- prepara uma futura multiplicação.

---

# 🏠 Anfitrião

O anfitrião sempre participa da célula.

Ele não é apenas alguém que disponibiliza o espaço físico.

Modelo:

```
Pessoa

+

Disponibiliza residência

+

Participa da célula
```

---

# 👥 Jornada de uma Pessoa na Célula

A participação em uma célula possui uma jornada própria.

Uma pessoa pode estar vinculada à célula mesmo antes de ser membro formal da IBAG.

Fluxo:

```
Visitante

↓

Participante da Célula

↓

Membro Ativo da Célula

↓

Membro IBAG

↓

Líder em Desenvolvimento

↓

Líder
```

---

# 🔄 Relacionamento Pessoa x Célula

Pessoa e célula possuem um relacionamento próprio.

Não deve ser considerado apenas um cadastro direto.

Modelo:

```
Pessoa

|

Participação na Célula

|

Célula
```

A participação possui informações próprias:

- data de entrada;
- origem;
- status;
- frequência;
- histórico.

---

# 📌 Regra de Negócio

Uma pessoa que participa de aproximadamente 3 encontros da mesma célula pode se tornar um membro ativo daquela célula.

Isso não significa necessariamente que ela já seja membro formal da IBAG.

Exemplo:

```
Pessoa:

João

Célula:
Azul 03

Participação:
Regular

Status:
Membro ativo da célula

Membro IBAG:
Não
```

---

# 📝 Visitantes

A célula pode receber visitantes.

A célula é uma porta de entrada para muitas pessoas conhecerem a IBAG.

Um visitante pode:

- participar dos encontros;
- criar relacionamento;
- ser acompanhado;
- futuramente iniciar uma jornada na igreja.

---

# 📊 Saúde da Célula

A saúde da célula é acompanhada através de indicadores.

Inicialmente utilizando informações já existentes no Eklesia.

Possíveis indicadores:

- quantidade de participantes;
- frequência;
- visitantes;
- encontros realizados;
- fotos;
- decisões;
- líderes preparados;
- existência de LT;
- potencial de multiplicação.

---

# 📸 Registro dos Encontros

Os encontros possuem registros.

Informações:

- data;
- realização do encontro;
- fotos;
- participantes;
- informações relevantes.

---

# 🗂️ Secretaria de Células (CCM)

A Secretaria de Células possui visão geral das células da IBAG.

Responsabilidades:

- acompanhamento das células;
- registros;
- suporte aos líderes;
- organização das informações.

A CCM possui abrangência geral.

---

# 🔄 Histórico da Célula

Nenhuma informação importante deve ser apagada.

Uma célula pode possuir histórico:

```
Célula Rosa 05

2026
Criada

2028
Multiplicação

2032
Encerrada
```

O histórico permanece disponível.

---

# 📍 Estados da Célula

Uma célula pode possuir estados:

```
Planejamento

↓

Ativa

↓

Multiplicada

↓

Pausada

↓

Encerrada
```

---

# 🏛️ Princípio do Domínio

A célula representa o ambiente onde a visão da IBAG acontece de forma prática.

Modelo:

```
Visão da Igreja

↓

Campus

↓

Célula

↓

Liderança

↓

Pessoas

↓

Discipulado
```

O objetivo do IBAG One não é apenas registrar células.

É permitir que a igreja cuide melhor das pessoas.
