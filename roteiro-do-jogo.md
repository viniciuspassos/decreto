# Decreto: Roteiro do Jogo (Versão 0.4)

> Jogo de política.
> O documento tem duas partes, ambas aprovadas pelo Vinicius:
> - **Parte 1:** as regras do jogo.
> - **Parte 2:** o conteúdo detalhado (árvores, grupos, custos, regimes, utopias, repressão e figuras históricas).
>
> Não há dúvidas de negócio em aberto nesta versão.

---

## Parte 1: O que já está definido

### 1. Premissa e produto

0. **Nome do jogo:** **Decreto**, o mesmo em todos os idiomas (sem tradução para o inglês).
1. **Papel do jogador:** presidente de um **país fictício**.
2. **Mandato:** 4 anos para implementar políticas de governo, com o objetivo de ser **reeleito**.
3. **Posição inicial neutra:** ao assumir, o presidente não tem nenhum posicionamento político.
4. **Liberdade nos dois espectros:** o jogador pode misturar ações de qualquer lado (ex.: **proibir armas** e **liberar cassinos**).
5. **O jogo não tem ética própria:** a moral do governo vai sendo definida pelas ações do jogador.
6. **Plataforma:** **web**.
7. **Tom:** **simulação séria**.
8. **Interface:** rede de nós, com **imagens que aparecem após eventos marcantes**.
9. **Idiomas:** **português (pt-BR) e inglês**.

### 2. Turnos e ações

11. **Turnos semestrais:** cada mandato de 4 anos tem **8 turnos**.
12. **De 0 a 6 ações por turno**, em vários campos (economia, educação, segurança etc.), desde que ainda haja capital político.
13. **Ajustar a intensidade** de uma política também conta como uma das 6 ações.

### 3. Políticas

14. **Árvores de políticas:** cada árvore segue **uma única direção**, da ação menos radical para a mais radical. Exemplo: **polícia secreta** → **prender opositores** → **tortura**.
15. **Campos e árvores:** um campo (ex.: segurança) pode conter **várias árvores**.
16. **Pré-requisito:** para usar um nó, o nó anterior da árvore precisa estar **ativo**.
16.1. **Árvores opostas se bloqueiam:** se uma árvore está ativa (ex.: Desarmamento), a árvore oposta (ex.: Armamento civil) fica bloqueada.
17. **Desfazer nós:** o presidente **não pode desfazer** as próprias políticas. Só um **novo presidente** pode desfazer políticas do governo anterior. Isso inclui o jogador quando **volta ao poder depois de perder**: ele pode desfazer o que o antecessor fez. Na **reeleição seguida**, o jogador continua sem poder desfazer as próprias políticas. Ao desfazer um nó, os nós que dependem dele **caem juntos**. Quanto **mais radical** o nó, **menos capital** é preciso para desfazê-lo, ao contrário da criação.
18. **Tipos:** existem políticas **liga/desliga** e políticas **de intensidade**.
19. **Efeito no tempo:** o efeito cresce de forma acelerada e atinge o **impacto total até o fim do semestre**. Quanto mais radical, mais imediato. Depois disso, o efeito **continua** enquanto a política estiver ativa, e pode ser **modificado por outras políticas**.
20. **Consequências:** as políticas alteram os indicadores do país e a opinião de grupos e aliados. Cada ação aumenta o apoio de um grupo e reduz o de outro.

### 4. Capital político

21. **Ganho:** depende **apenas da aprovação**. Ministros e Congresso não têm efeito no jogo. Por isso **não existe impeachment**.
22. **Acúmulo:** o capital que sobra num turno **acumula** para o próximo.
23. **Radicalidade** é medida por **dois fatores**:
    - a **profundidade** do nó na árvore (peso maior);
    - a **distância** em relação à situação atual do país (peso menor).
24. **Custo:** cresce de forma **linear** com a radicalidade, com pesos customizados *(ver S3 na Parte 2)*.
25. **Lua de mel:** se o presidente foi eleito com **margem muito grande**, pode tomar **algumas poucas ações radicais com pouco capital nos primeiros 6 meses**.
26. **Crises** (atentado, colapso econômico) **barateiam** medidas extremas temporariamente.

### 5. País, economia e atores

27. **Indicadores:** PIB, desemprego, inflação, dívida, criminalidade, saúde, educação, poluição, liberdade de imprensa e corrupção.
28. **Orçamento:** conta simples, **número de habitantes × % de imposto**. Impostos e orçamento **não são o foco** do jogo: o foco são as políticas públicas.
29. **Dívida:** o governo pode se endividar sem limite, mas a economia piora cada vez mais. A dívida alta leva à **recessão**.
30. **Recessão causa:** desemprego, queda de apoio, menos arrecadação e, dependendo do nível, **surgimento de rebeldes** e **golpe** para derrubar o governo.
31. **Sem partidos:** o jogo não usa partidos nem bancadas. O apoio é medido apenas pela **opinião pública** dos grupos.
32. **Atores que reagem:** **mídia** e **Forças Armadas**.
33. **Eventos aleatórios e crises:** existem, mas são **raros e improváveis**.

### 6. Eleitores

34. Um eleitor pode pertencer a **vários grupos** ao mesmo tempo.
35. O **tamanho dos grupos muda**, impactado pelas políticas (pessoas que gostaram e que não gostaram).
36. Os grupos têm **memória e lealdade**.

### 7. Eleições e promessas

37. **Eleição a cada 8 turnos** (4 anos).
38. **Promessas de campanha:** ao concorrer, o jogador faz promessas. Se não forem cumpridas no mandato, o grupo que gostou delas reage **negativamente**.
39. **Perder a eleição:** o jogador avança no tempo, acompanha os indicadores e as principais ações do governante atual, e **pode concorrer de novo** numa eleição futura. O novo governante (controlado pelo computador) **não desfaz** as políticas do jogador: ele cumpre as principais promessas de campanha, mas eventualmente pode descumpri-las.

### 8. Caminhos extremos

40. **Autoritarismo e monarquia** são **formas de continuar no poder** (não são finais próprios). Os 20 anos no poder contam também sob esses regimes.
41. **Monarquia:** chega-se a ela por **coroação**. Existe **herdeiro**, mas ele também pode ser **nomeado**.
42. **Utopias:** *1984* (vigilância total), socialista, anarcocapitalista, teocracia e tecnocracia/ecotopia. Instalá-las deve ser **extremamente difícil**.
43. **Repressão:** tortura, assassinato de opositores e outras ações estão permitidas *(ver S6 na Parte 2)*.

### 9. Fim de jogo

| Condição | Resultado |
|---|---|
| Ficar **20 anos seguidos** no poder (em democracia ou em regime autoritário/monarquia) | **Vitória** |
| **Instalar uma utopia** | **Vitória** |
| **Morrer** num atentado | **Derrota** |
| Chegar a **40 anos** de jogo sem vencer | **Derrota** |
| **Golpe militar**, **revolução** ou forma similar de derrubada | Derrota |

44. **Atentado:** feito por grupos muito insatisfeitos ou por revolucionários que surgiram durante o governo. **Pode falhar**.
45. **Falência do Estado não é** condição de derrota.
46. **Sem pontuação.** No final, o jogo compara o governo do jogador com **figuras históricas** (ex.: "Parabéns, você governou com semelhanças com César") *(ver S7 na Parte 2)*.

### Loop principal

```
Posse (sem posicionamento; promessas de campanha a partir da 2ª eleição)
   → turno (semestre): escolher de 0 a 6 ações, pagas com capital político
       (capital vem da aprovação; o que sobra acumula)
   → efeitos crescem até o fim do semestre (mais radical = mais imediato)
   → indicadores, dívida, tamanho e apoio dos grupos mudam; mídia e Forças Armadas reagem
   → riscos: atentado, rebeldes, golpe, revolução
   → a cada 8 turnos: eleição (se ainda houver eleições)
        venceu → novo mandato
        perdeu → acompanha o novo governo e pode concorrer de novo
   → fim: 20 anos no poder ou utopia (vitória); morte, 40 anos ou queda (derrota)
   → comparação com figuras históricas
```

---

## Parte 2: Conteúdo aprovado

Sugestões aprovadas pelo Vinicius.

### S1. Campos e árvores (C1.1)

Cada árvore segue uma única direção. Por isso, lados opostos viram **árvores diferentes** no mesmo campo (ex.: "Desarmamento" e "Armamento civil"). Os nós vão do 1 (moderado) ao último (mais radical).

| Campo | Árvore | Nós (do moderado ao radical) |
|---|---|---|
| **Segurança** | Desarmamento | Registro obrigatório → Restrição de porte → Recompra de armas → Proibição total |
| | Armamento civil | Facilitar registro → Porte para cidadãos → Porte livre → Milícias civis legalizadas |
| | Linha dura | Aumento de penas → Militares nas ruas → Prisão perpétua → Pena de morte |
| | Polícia secreta | Polícia secreta → Vigilância de opositores → Prender opositores → Tortura → Assassinato de opositores |
| **Economia** | Estatização | Estatal estratégica → Controle de preços → Estatização de setores → Fim da propriedade privada |
| | Livre mercado | Privatizações → Desregulação → Fim do salário mínimo → Estado mínimo |
| | Impostos | Intensidade de 0% a 70% (política de intensidade) |
| **Trabalho** | Direitos trabalhistas | Aumento do salário mínimo → Jornada reduzida → Estabilidade no emprego → Sindicato único estatal |
| | Flexibilização | Terceirização → Reforma trabalhista → Fim de encargos → Proibição de greves |
| **Saúde** | Saúde pública | Ampliação da rede pública → Remédios gratuitos → Saúde 100% estatal |
| | Saúde privada | Parcerias privadas → Vouchers de saúde → Fim da saúde pública |
| **Educação** | Educação pública | Merenda e bolsas → Universidade gratuita → Ensino integral obrigatório → Escola estatal única |
| | Educação ideológica | Escolas cívico-militares → Currículo nacional único → Doutrinação estatal → Juventude do partido |
| **Costumes** | Liberdades individuais | Casamento igualitário → Aborto legal → Legalização da maconha → Legalização de todas as drogas |
| | Conservadorismo | Proibição de cassinos → Proibição do aborto → Religião oficial → Lei religiosa |
| | Jogos de azar | Loteria estatal → Apostas online → Cassinos liberados |
| **Meio ambiente** | Ambientalismo | Metas de emissão → Proteção de reservas → Fim dos combustíveis fósseis → Decrescimento obrigatório |
| | Exploração | Licenças ambientais mais fáceis → Mineração em reservas → Fim das leis ambientais |
| **Imigração** | Abertura | Vistos facilitados → Anistia a imigrantes → Fronteiras abertas |
| | Fechamento | Cotas → Muro na fronteira → Deportação em massa |
| **Imprensa e liberdades** | Controle da mídia | Regulação da mídia → Mídia estatal forte → Censura → Monopólio estatal da informação |
| | Vigilância | Câmeras públicas → Monitoramento de internet → Vigilância em massa → Polícia do pensamento |
| **Poder e regime** | Autoritarismo | *(ver S4)* |
| | Monarquia | *(ver S4)* |
| | Culto à personalidade | Propaganda do governo → Feriado em homenagem ao líder → Estátuas e retratos obrigatórios → Reescrita da história |

### S2. Grupos de eleitores (D1)

| Grupo | Gosta de | Não gosta de |
|---|---|---|
| Religiosos | Conservadorismo, religião oficial | Liberdades individuais, cassinos |
| Progressistas | Liberdades individuais, ambientalismo | Censura, religião oficial |
| Empresários | Livre mercado, flexibilização | Estatização, impostos altos |
| Trabalhadores | Direitos trabalhistas, saúde pública | Flexibilização, desemprego |
| Pobres | Saúde e educação públicas | Impostos altos, inflação |
| Classe média | Linha dura, inflação baixa | Impostos altos, criminalidade |
| Ricos | Livre mercado, impostos baixos | Estatização |
| Ambientalistas | Ambientalismo | Exploração |
| Agronegócio | Exploração, armamento civil | Ambientalismo |
| Militares e policiais | Linha dura, polícia secreta | Desmilitarização da polícia, cortes |
| Jovens | Educação pública, liberdades individuais | Censura, desemprego |
| Aposentados | Saúde pública, inflação baixa | Flexibilização, inflação |
| Nacionalistas | Fechamento de fronteiras, culto à personalidade | Abertura |
| Imigrantes | Abertura | Fechamento |
| Donos de armas | Armamento civil | Desarmamento |
| Revolucionários *(surgem durante o jogo)* | Nenhum governo | O governo atual |
| Rebeldes *(surgem com a recessão)* | Queda do governo | O governo atual |

### S3. Pesos do custo de capital (E2/E3)

Fórmula linear sugerida:

```
custo = 10 × (1 + 1,0 × profundidade + 0,4 × distância)
```

- **Profundidade:** posição do nó na árvore (1, 2, 3...).
- **Distância:** de 0 a 3, o quanto a ação se afasta da situação atual. Exemplo: 0 se o país já está "perto" dessa política, 3 se ela contraria quase tudo que está ativo.
- **Ajuste de intensidade:** custo = 10 × (1 + tamanho do salto em faixas de 10%).
- **Desfazer (só pelo novo presidente):** usa a fórmula invertida, ou seja, quanto mais profundo, mais barato.
- **Lua de mel:** se a margem de vitória for de 20 pontos ou mais, até **2 ações** no primeiro semestre custam **metade**.
- **Crise:** durante uma crise grave, ações das árvores de Segurança e de Poder e regime custam **30% a menos**.

Exemplo: prender opositores (profundidade 3, distância 2) custa 10 × (1 + 3 + 0,8) = **48**.

### S4. Etapas dos regimes (F2 e F3)

**Autoritarismo:**
1. Estado de emergência (exige uma crise ou aprovação alta)
2. Governar por decreto
3. Controle do Judiciário
4. Dissolução do Congresso
5. Adiamento das eleições
6. Fim das eleições / partido único

**Monarquia** (exige ter passado por Autoritarismo 4 ou Culto à personalidade 3):
1. Título vitalício ("presidente vitalício")
2. Nova Constituição
3. Coroação
4. Sucessão: herdeiro natural ou nomeado

### S5. Como instalar uma utopia (F4.1)

Para ser **extremamente difícil**, cada utopia exige **três coisas ao mesmo tempo**, mantidas por **4 turnos seguidos** (2 anos):

1. Um conjunto de árvores **completas** (todos os nós ativos).
2. Indicadores mínimos.
3. Sobreviver ao período sem golpe, revolução ou atentado bem-sucedido.

| Utopia | Árvores completas | Indicadores |
|---|---|---|
| *1984* (vigilância total) | Vigilância, Controle da mídia, Polícia secreta, Culto à personalidade, Autoritarismo | Liberdade de imprensa ≈ 0; nenhum grupo revolucionário ativo |
| Socialista | Estatização, Direitos trabalhistas, Saúde e Educação públicas | Desigualdade mínima; desemprego baixo |
| Anarcocapitalista | Livre mercado, Flexibilização, Saúde privada; imposto ≈ 0% | PIB alto; criminalidade controlada |
| Teocracia | Conservadorismo, Educação ideológica, Autoritarismo | Religiosos como maior grupo; apoio religioso alto |
| Tecnocracia / ecotopia | Ambientalismo, Educação pública, Vigilância (até o nó 2) | Poluição mínima; educação e saúde altas |

### S6. Até onde ir na repressão (F6)

Sugestão de conteúdo dentro do jogo:

- **Incluído:** censura, prisão de opositores, tortura, desaparecimentos, assassinato de opositores, campos de "reeducação", expurgos nas Forças Armadas e no partido, execuções públicas.
- **Fora do jogo:** genocídio ou extermínio de grupos étnicos e religiosos. Também sugiro **não ter violência gráfica**: a repressão aparece em texto, manchetes e imagens sóbrias, dentro do tom de simulação séria.

O peso dessas ações vem das consequências: queda de apoio, surgimento de revolucionários, reação da mídia e risco de golpe ou atentado.

### S7. Comparação com figuras históricas (H2)

No fim do jogo, o perfil do governo (regime, árvores mais usadas, repressão, tempo no poder, resultado econômico) é comparado com uma lista de figuras. Sugestões:

| Perfil do governo | Figura |
|---|---|
| Expansão de poder pessoal, fim da república | Júlio César |
| Monarquia absoluta, culto à personalidade | Luís XIV |
| Reformas autoritárias com modernização | Napoleão |
| Vigilância total e expurgos | Stálin |
| Estatização e revolução | Mao Tsé-Tung |
| Democracia, reconciliação, longa popularidade | Nelson Mandela |
| Democracia em crise, união do país | Abraham Lincoln |
| Nacionalismo com direitos trabalhistas | Getúlio Vargas |
| Livre mercado radical | Margaret Thatcher |
| Teocracia | Khomeini |
| Governo curto, derrubado | Salvador Allende |
