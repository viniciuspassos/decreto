# Decreto: Game Design Document (Version 0.4)

> Political game.
> This document has two parts, both approved by Vinicius:
> - **Part 1:** game rules.
> - **Part 2:** detailed content (trees, groups, costs, regimes, utopias, repression, and historical figures).
>
> There are no open business questions in this version.

---

## Part 1: Defined rules

### 1. Premise and product

0. **Game name:** **Decreto**, the same in every language (not translated into English).
1. **Player role:** president of a **fictional country**.
2. **Term:** 4 years to implement government policies and try to get **reelected**.
3. **Neutral starting position:** the president takes office without a political position.
4. **Freedom across the political spectrum:** the player can mix actions from either side (for example, **proibir armas** and **liberar cassinos**).
5. **The game has no built-in ethics:** the government's morality is defined by the player's actions.
6. **Platform:** **web**.
7. **Tone:** **serious simulation**.
8. **Interface:** node graph, with **images shown after major events**.
9. **Languages:** **Portuguese (pt-BR) and English**.

### 2. Turns and actions

11. **Six-month turns:** each four-year term has **8 turns**.
12. **0 to 6 actions per turn** across fields (economy, education, security, etc.), as long as political capital remains.
13. **Adjusting a policy's intensity** also counts as one of the 6 actions. Raising or lowering intensity is an adjustment, not an undo; the sitting president can change it in either direction.

### 3. Policies

14. **Policy trees:** each tree follows **one direction**, from less radical to more radical actions. Example: **polícia secreta** → **prender opositores** → **tortura**.
15. **Fields and trees:** a field (for example, security) can contain **several trees**.
16. **Prerequisite:** the previous node in a tree must be **active** before a node can be used.
16.1. **Opposing trees block each other:** if one tree is active (for example, Desarmamento), the opposing tree (for example, Armamento civil) is blocked.
17. **Undoing nodes:** the president **cannot undo** their own policies. Only a **new president** can undo policies from the previous administration. This also applies when the player **returns to power after losing**: they can undo what their predecessor did. After **consecutive reelection**, the player still cannot undo their own policies. Undoing a node also removes all dependent nodes. The **more radical** a node is, the **less political capital** it costs to undo, the reverse of activation.
18. **Types:** policies can be **on/off** or **intensity-based**.
19. **Effects over time:** an effect ramps up and reaches its **full impact by the end of the semester**. More radical effects arrive sooner. The effect then **continues** while the policy is active and can be **modified by other policies**. The engine applies full impact at semester end; "more radical, more immediate" is shown in the animation and in consequences (events) during the activation semester.
20. **Consequences:** policies change country indicators and the opinions of groups and allies. Each action increases one group's support and decreases another's.

### 4. Political capital

21. **Gain:** depends **only on approval**. Ministers and Congress have no effect in the game, so **there is no impeachment**.
22. **Carryover:** political capital left over in a turn **carries over** to the next.
23. **Radicalism** is measured by **two factors**:
    - the node's **depth** in its tree (higher weight);
    - the **distance** from the country's current situation (lower weight).
24. **Cost:** grows **linearly** with radicalism, using custom weights *(see S3 in Part 2)*.
25. **Honeymoon:** if the president wins by a **very large margin**, they can take **a few radical actions at low cost during the first 6 months**.
26. **Crises** (assassination attempt, economic collapse) temporarily **reduce the cost** of extreme measures.

### 5. Country, economy, and actors

27. **Indicators:** GDP, unemployment, inflation, debt, crime, health, education, pollution, press freedom, and corruption.
28. **Budget:** a simple calculation, **population × tax rate**. Taxes and the budget **are not the focus**; public policy is.
29. **Debt:** the government can borrow without a limit, but the economy deteriorates over time. High debt leads to **recession**.
30. **Recession causes:** unemployment, falling support, lower revenue and, depending on its level, **rebels emerging** and a **coup** to remove the government.
31. **No parties:** the game has no parties or legislative blocs. Support is measured only through the groups' **public opinion**.
32. **Reactive actors:** **the media** and **Armed Forces**.
33. **Events and crises:** occur **every semester** (1 to 3), driven mainly by active policies and the state of the country. The country keeps moving and things happen even without new policies. Some events ask the player to choose between two responses. Numbers and catalog: `docs/game-design/movement-effects-events.md`.

### 6. Voters

34. A voter can belong to **multiple groups** at once.
35. **Group sizes change** in response to policies (people who liked or disliked them).
36. Groups have **memory and loyalty**.

### 7. Elections and promises

37. **An election every 8 turns** (4 years).
38. **Campaign promises:** at the end of the final semester, the player selects promises and confirms to run the election immediately. If the promises are not fulfilled during the next term, the group that liked them reacts **negatively**.
39. **Losing an election:** time advances; the player follows the indicators and main actions of the current leader, and **can run again** in a future election. The new leader (computer-controlled) **does not undo** the player's policies: they fulfill their main campaign promises, though they may eventually break them.

### 8. Extreme paths

40. **Authoritarianism and monarchy** are **ways to stay in power**, not endings of their own. The 20-year time-in-power victory condition also applies under these regimes.
41. **Monarchy:** reached through a **coronation**. There is an **heir**, who can also be **appointed**.
42. **Utopias:** *1984* (total surveillance), socialist, anarcho-capitalist, theocracy, and technocracy/ecotopia. Installing one should be **extremely difficult**.
43. **Repression:** torture, assassination of opponents, and other actions are allowed *(see S6 in Part 2)*.

### 9. End game

| Condition | Outcome |
|---|---|
| Stay in power for **20 consecutive years** (democracy, authoritarian regime, or monarchy) | **Victory** |
| **Install a utopia** | **Victory** |
| **Die** in an assassination | **Defeat** |
| Reach **40 years** of play without winning | **Defeat** |
| **Military coup**, **revolution**, or similar removal | Defeat |

44. **Assassination attempt:** carried out by deeply dissatisfied groups or revolutionaries that emerged during the administration. It **can fail**.
45. **State bankruptcy is not** a defeat condition.
46. **No score.** At the end, the game compares the player's administration with **historical figures** (for example, "Parabéns, você governou com semelhanças com César") *(see S7 in Part 2)*.

### Main loop

```
Inauguration (no political position; campaign promises begin with the 2nd election)
   → turn (semester): choose 0 to 6 actions, paid for with political capital
       (capital comes from approval; unused capital carries over)
   → effects ramp up by the end of the semester (more radical = more immediate)
   → indicators, debt, group sizes and support change; the media and Armed Forces react
   → risks: assassination, rebels, coup, revolution
   → every 8 turns: election (if elections still exist)
        win → new term
        lose → follow the new government and run again later
   → end: 20 years in power or utopia (victory); death, 40 years, or removal (defeat)
   → comparison with historical figures
```

---

## Part 2: Approved content

Suggestions approved by Vinicius.

### S1. Fields and trees (C1.1)

Each tree follows one direction. Opposing sides therefore become **separate trees** in the same field (for example, "Desarmamento" and "Armamento civil"). Nodes run from 1 (moderate) to the last (most radical).

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

### S2. Voter groups (D1)

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

### S3. Political capital cost weights (E2/E3)

Suggested linear formula:

```
custo = 10 × (1 + 1,0 × profundidade + 0,4 × distância)
```

- **Depth:** the node position in its tree (1, 2, 3...).
- **Distance:** from 0 to 3, how far the action moves from the current situation. For example, 0 if the country is already "close" to the policy, 3 if it conflicts with nearly everything active.
- **Intensity adjustment:** cost = 10 × (1 + jump size in 10% increments).
- **Undo (only by a new president):** uses the inverse formula; deeper nodes cost less.
- **Honeymoon:** if the victory margin is 20 points or more, up to **2 actions** in the first semester cost **half** as much.
- **Crisis:** during a severe crisis, actions in Security and Power and regime trees cost **30% less**.

Example: prender opositores (depth 3, distance 2) costs 10 × (1 + 3 + 0.8) = **48**.

### S4. Regime stages (F2 and F3)

**Authoritarianism:**
1. Estado de emergência (exige uma crise ou aprovação alta, ≥ 60)
2. Governar por decreto
3. Controle do Judiciário
4. Dissolução do Congresso
5. Adiamento das eleições
6. Fim das eleições / partido único

**Monarchy** (requires completing Authoritarianism 4 or Personality cult 3):
1. Título vitalício ("presidente vitalício")
2. Nova Constituição
3. Coroação
4. Sucessão: herdeiro natural ou nomeado

### S5. Installing a utopia (F4.1)

To make them **extremely difficult**, each utopia requires **three conditions at once**, maintained for **4 consecutive turns** (2 years):

1. A set of **complete** trees (all nodes active).
2. Minimum indicator thresholds.
3. Survive the period without a coup, revolution, or successful assassination.

| Utopia | Árvores completas | Indicadores |
|---|---|---|
| *1984* (vigilância total) | Vigilância, Controle da mídia, Polícia secreta, Culto à personalidade, Autoritarismo | Liberdade de imprensa ≈ 0; nenhum grupo revolucionário ativo |
| Socialista | Estatização, Direitos trabalhistas, Saúde e Educação públicas | Desigualdade mínima; desemprego baixo |
| Anarcocapitalista | Livre mercado, Flexibilização, Saúde privada; imposto ≈ 0% | PIB alto; criminalidade controlada |
| Teocracia | Conservadorismo, Educação ideológica, Autoritarismo | Religiosos como maior grupo; apoio religioso alto |
| Tecnocracia / ecotopia | Ambientalismo, Educação pública, Vigilância (até o nó 2) | Poluição mínima; educação e saúde altas |

### S6. Limits of repression (F6)

Suggested in-game content:

- **Included:** censorship, imprisonment of opponents, torture, disappearances, assassination of opponents, "reeducation" camps, purges in the Armed Forces and party, public executions.
- **Out of scope:** genocide or extermination of ethnic and religious groups. Also, **avoid graphic violence**: repression appears in restrained text, headlines, and images, consistent with the serious simulation tone.

The impact of these actions comes from their consequences: falling support, revolutionaries emerging, media reaction, and the risk of a coup or assassination.

### S7. Comparison with historical figures (H2)

At the end of the game, the administration profile (regime, most-used trees, repression, time in power, and economic outcome) is compared with a list of figures. Suggestions:

| Administration profile | Figure |
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
