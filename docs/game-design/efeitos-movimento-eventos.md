# Decreto: especificação final de efeitos, movimento e eventos (v2)

> Complementa o `roteiro-do-jogo.md` (fonte de verdade de design) com os números de efeitos, movimento
> e eventos. Todos os números aqui são **finais para o MVP**:
> implementar como estão e ajustar só depois de playtest (ver §7).
> Ids de nós, árvores e grupos são exatamente os de `policy-trees.ts` e `voter-groups.ts`.
> Tudo o que está nas tabelas é **dado** (`packages/game-content`); as fórmulas são o **motor**
> (`packages/game-engine`, funções puras, RNG com seed).

---

## 1. Convenções

### 1.1 Indicadores, unidades e limites

| Id | Unidade | Faixa (clamp) | Natureza |
|---|---|---|---|
| `gdp` | crescimento real anualizado, % | −15 a +15 | taxa (nível) |
| `unemployment` | % da força de trabalho | 1 a 45 | nível |
| `inflation` | % ao ano | −5 a 300 | nível |
| `debt` | % do PIB | 0 a 400 | **estoque** (acumula) |
| `crime`, `health`, `education`, `pollution`, `pressFreedom`, `corruption` | índice 0–100 | 0 a 100 | nível |

Os valores são guardados com precisão total; a UI arredonda para 1 casa.

### 1.2 Base + deslocamentos (o modelo inteiro numa linha)

Para os 9 indicadores de nível:

```
exibido = clamp( base + deslocamentoPolíticas + deslocamentoRecessão + deslocamentoRebeldes )
```

- **`base`**: o "país sem as políticas". É o que se move sozinho (tendência, ruído, acoplamentos,
  choques de eventos), ver §3.
- **`deslocamentoPolíticas`**: soma dos efeitos de **todos os nós ativos** + linha da tabela de
  impostos. Efeito de nó é **nível enquanto ativo**: não acumula por semestre e some se o nó for
  desfeito (por outro presidente). Valores da tabela são **incrementais** (nó N soma ao nó N−1).
- **`debt`** é a exceção: é estoque. Nós têm dois campos de dívida:
  - **Dív/sem**: soma ao déficit primário **a cada semestre** em que o nó está ativo (pp do PIB).
  - **Dív única**: soma **uma vez**, no semestre de ativação (privatização, indenização, obra).
- "Efeito modificável por outras políticas" (roteiro §3.19) = soma dos efeitos + acoplamentos entre
  indicadores (§3.3). **Não há tabela de interações par-a-par** no MVP.

### 1.3 Rampa ("mais radical = mais imediato")

Decisão: o motor aplica **100% do efeito no fim do semestre de ativação** (leitura literal do
roteiro §3.19: "atinge o impacto total até o fim do semestre"). A rampa vira:

1. **Só animação na UI**: o valor cresce com curva `t^k`, `k = max(1,2; 3 − 0,4 × (profundidade − 1))`.
2. **Peso de evento no semestre de ativação**: eventos disparados por um nó recém-ativado têm peso
   × `(1 + 0,5 × profundidade)` (ver §4.2). Radical = consequência visível imediata.

### 1.4 Impostos (árvore de intensidade `taxes`)

- Estado guardado como `taxRate ∈ {0, 10, 20, 30, 40, 50, 60, 70}`. Os nós `taxes-20` … `taxes-70`
  são derivados (`taxes-X` ativo ⇔ `taxRate ≥ X`); 0% e 10% não têm nó.
- **Estado inicial: 30%** (`taxes-20` e `taxes-30` ativos, herdados: não contam como política do
  jogador, nem revelam figura, nem entram na comparação final).
- **Subir ou baixar é ajuste de intensidade, não "desfazer"**: o presidente em exercício pode mover
  nos dois sentidos (roteiro §2.13 e S3). Custo: `10 × (1 + salto em faixas de 10%)`. Conta como 1 ação.
- Reação de grupos: subir = "dislike" de `taxes` (empresários, pobres, classe média, ricos −4 por
  ação); **baixar = "like" invertido** (+4 para os mesmos grupos).
- Efeitos por alíquota (absolutos, relativos a 30% = zero):

| taxRate | PIB | Des | Saú | Edu | Crime | Corr | Dív/sem |
|---|---|---|---|---|---|---|---|
| 0 | +1,0 | −0,6 | −5 | −5 | +3 | | +2,6 |
| 10 | +0,7 | −0,4 | −3 | −3 | +2 | | +1,8 |
| 20 | +0,35 | −0,2 | −1,5 | −1,5 | +1 | | +0,9 |
| 30 | | | | | | | |
| 40 | −0,3 | +0,2 | +1,5 | +1,5 | | | −0,8 |
| 50 | −0,7 | +0,5 | +3 | +3 | −1 | +1 | −1,5 |
| 60 | −1,2 | +0,9 | +4 | +4 | −1 | +2 | −2,0 |
| 70 | −1,8 | +1,4 | +5 | +5 | −1 | +3 | −2,3 |

(Arrecadação com retorno decrescente acima de 50%: Laffer simples.)

### 1.5 Estado inicial

Mantém o mock atual (`unstable`): gdp 1,8 · unemployment 9,4 · inflation 6,1 · debt 74 · crime 38 ·
health 52 · education 49 · pollution 44 · pressFreedom 58 · corruption 36. `stable` e `crisis`
sobrescrevem como no mock. No turno 1, `base = exibido` (não há políticas ativas além de impostos 30%,
que é zero) e `base(t−2) = base(t−1)` (momento zero).

### 1.6 Modificadores por nó (colunas "Mods" das tabelas)

| Sigla | Significado | Unidade |
|---|---|---|
| `mil` | humor militar (escore) | pontos somados ao escore militar (§3.6) |
| `mid` | humor da mídia (escore) | pontos somados ao escore da mídia (§3.6) |
| `gol` / `ate` / `rev` | risco de golpe / atentado / revolução | pp somados ao risco do semestre (§3.7) |
| `ate×0,7` | proteção contra atentado | multiplicador (empilha) |
| `crev` | crescimento de revolucionários | pp de população por semestre (§3.8) |
| `anc` | âncora de apoio | pontos somados à âncora de apoio de todos os grupos (§3.5) |
| `tam` | tamanho de grupo | ver nota de cada nó |

---

## 2. Efeitos de todos os 99 nós

Células vazias = 0. "Dív/s" = por semestre; "Dív 1×" = única na ativação.

### Segurança

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **disarmament** | | | | | | | | | | | | |
| mandatory-registration | | | | −2 | | | | | −1 | | | |
| carry-restriction | | | | −3 | | | | | | | | |
| gun-buyback | | | | −3 | | | | | | | +2 | |
| total-gun-ban | | | | −3 | | | | | +2 | | | ate −2 |
| **civil-arms** | | | | | | | | | | | | |
| easier-registration | | | | +1 | | | | | −1 | | | |
| citizen-carry | | | | +2 | | | | | | | | ate +1 |
| free-carry | | | | +3 | | | | | | | | ate +1 |
| legal-militias | | | | +4 | | | | −2 | +3 | | | mil −15, gol −5, rev −4, ate +2 |
| **hard-line** | | | | | | | | | | | | |
| harsher-sentences | | | | −2 | | | | | | +0,3 | | mil +5 |
| military-on-streets | | | | −5 | | | | −2 | +1 | +0,5 | | mil +10, rev −2; rebeldes crescem ×0,5; atentado fatal −10 pp |
| life-sentence | | | | −2 | | | | | | +0,3 | | |
| death-penalty | | | | −3 | | | | −2 | | | | mil +5, mid −10, crev +0,1 |
| **secret-police** | | | | | | | | | | | | |
| secret-police | | | | | | | | −4 | +2 | +0,2 | | mil +5, gol −2, rev −2, ate×0,7; atentado fatal −10 pp |
| opposition-surveillance | | | | | | | | −6 | +1 | | | mid −10, rev −3, ate −1, crev +0,1 |
| arrest-opponents | | | | | | | | −10 | +2 | | | mid −15, rev −5, gol −1, crev +0,2 |
| torture | | | | −1 | | | | −6 | +3 | | | mid −15, rev −3, ate +2, crev +0,3 |
| opponent-assassination | | | | | | | | −8 | +3 | | | mid −20, mil −5, rev −6, ate +4, crev +0,4 |

### Economia

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **statization** | | | | | | | | | | | | |
| strategic-state-company | +0,2 | −0,5 | | | | | | | +2 | +0,3 | +3 | |
| price-controls | −0,4 | | −3,0 | | | | | | +1 | | | |
| sector-nationalization | −0,6 | −1,0 | | | | | | | +3 | +0,6 | +8 | |
| end-private-property | −2,0 | −2,5 | +4,0 | | | | | −5 | +5 | +1,0 | | mil −10, crev +0,2; tam: `rich` e `business` ×0,5 na ativação |
| **free-market** | | | | | | | | | | | | |
| privatizations | +0,4 | +0,5 | | | | | | | +1 | −0,2 | −6 | |
| deregulation | +0,6 | | | | | | +3 | | +2 | | | |
| end-minimum-wage | +0,4 | −1,2 | −0,5 | +2 | −2 | | | | | | | crev +0,1; tam: `poor` +0,15/sem |
| minimal-state | +0,8 | | | +3 | −6 | −6 | | | | −1,5 | | mil −10; tam: `poor` +0,2/sem |
| **taxes** | ver tabela §1.4 | | | | | | | | | | | |

### Trabalho

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **labor-rights** | | | | | | | | | | | | |
| minimum-wage-raise | | +0,3 | +0,5 | −1 | +1 | | | | | | | tam: `poor` −0,1/sem |
| shorter-workweek | −0,3 | −0,5 | | | +1 | | | | | | | |
| job-stability | −0,4 | −0,4 | +0,3 | | | | | | | | | |
| state-single-union | −0,3 | | | | | | | −3 | +3 | | | rev −2 |
| **flexibilization** | | | | | | | | | | | | |
| outsourcing | +0,3 | −0,3 | | | −1 | | | | | | | |
| labor-reform | +0,4 | −0,8 | | | | | | | | | | |
| end-payroll-taxes | +0,5 | −0,8 | | | | | | | | +0,8 | | |
| strike-ban | +0,3 | | | | | | | −4 | | | | crev +0,1 |

### Saúde

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **public-health** | | | | | | | | | | | | |
| public-network-expansion | | | | | +5 | | | | | +0,6 | | |
| free-medicines | | | | | +4 | | | | | +0,5 | | |
| fully-state-health | −0,2 | | | | +3 | | | | +2 | +0,6 | | |
| **private-health** | | | | | | | | | | | | |
| private-partnerships | +0,1 | | | | +2 | | | | +1 | −0,3 | | |
| health-vouchers | | | | | +1 | | | | +1 | −0,3 | | |
| end-public-health | +0,2 | | | | −9 | | | | | −1,2 | | crev +0,1; tam: `poor` +0,1/sem |

### Educação

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **public-education** | | | | | | | | | | | | |
| school-meals-grants | | | | −1 | +1 | +3 | | | | +0,4 | | tam: `poor` −0,1/sem |
| free-university | | | | | | +4 | | | | +0,6 | | |
| mandatory-full-time-school | | | | −2 | | +4 | | | | +0,5 | | |
| single-state-school | | | | | | +1 | | −4 | +1 | +0,3 | | |
| **ideological-education** | | | | | | | | | | | | |
| civic-military-schools | | | | −1 | | +1 | | | | +0,1 | | mil +5 |
| single-national-curriculum | | | | | | −1 | | −1 | | | | anc +1 |
| state-indoctrination | | | | | | −3 | | −5 | | | | anc +2, rev −2, crev −0,1 |
| party-youth | | | | | | −2 | | −3 | | | | anc +2, rev −3, mil −5, crev −0,2 |

### Costumes

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **individual-liberties** | | | | | | | | | | | | |
| same-sex-marriage | | | | | | | | | | | | só reação de grupos (decisão: sem efeito de indicador) |
| legal-abortion | | | | | +2 | | | | | | | |
| cannabis-legalization | | | | −2 | | | | | −1 | −0,3 | | |
| all-drugs-legalization | | | | −3 | −4 | | | | −2 | −0,2 | | |
| **conservatism** | | | | | | | | | | | | |
| casino-ban | | | | −1 | | | | | −1 | +0,2 | | bloqueia `casinos-allowed` (ver §6.6) |
| abortion-ban | | | | | −3 | | | | | | | |
| official-religion | | | | −1 | | | | −2 | | | | anc +1; tam: `religious` +0,2/sem (teto 50) |
| religious-law | | | | −3 | | −3 | | −6 | | | | anc +2, rev −2, crev +0,1; tam: `religious` +0,3/sem (teto 50) |
| **gambling** | | | | | | | | | | | | |
| state-lottery | | | | | | | | | | −0,3 | | |
| online-betting | | | | | −1 | | | | +1 | −0,4 | | |
| casinos-allowed | +0,3 | | | +1 | | | | | +3 | −0,4 | | bloqueado por `casino-ban` |

### Meio ambiente

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **environmentalism** | | | | | | | | | | | | |
| emission-targets | −0,1 | | | | +1 | | −4 | | | | | |
| reserve-protection | −0,1 | | | | | | −4 | | | | | |
| end-fossil-fuels | −0,8 | +0,8 | +1,0 | | | | −10 | | | +0,3 | | |
| mandatory-degrowth | −2,0 | +2,0 | | | +2 | | −12 | | | | | crev +0,1 |
| **exploitation** | | | | | | | | | | | | |
| easier-environmental-licenses | +0,3 | | | | | | +4 | | +1 | | | |
| mining-in-reserves | +0,5 | | | | | | +7 | | +2 | −0,2 | | |
| end-environmental-laws | +0,6 | | | | −3 | | +10 | | +2 | | | |

### Imigração

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **openness** | | | | | | | | | | | | |
| easier-visas | +0,2 | | | | | | | | | | | |
| immigrant-amnesty | +0,2 | | | | | | | | −1 | +0,2 | | tam: `immigrants` +0,1/sem (teto 15) |
| open-borders | +0,5 | +0,6 | | | −1 | | | | | +0,3 | | tam: `immigrants` +0,3/sem (teto 15) |
| **closure** | | | | | | | | | | | | |
| immigration-quotas | −0,1 | | | | | | | | | | | |
| border-wall | | | | −1 | | | | | +1 | +0,1 | +3 | |
| mass-deportation | −0,6 | | +0,6 | | | | | −3 | +1 | | +1,5 | crev +0,1; tam: `immigrants` ×0,5 na ativação |

Decisão de tom: **imigração não mexe em criminalidade** (evita estereótipo; o custo/benefício é
econômico e político).

### Imprensa e liberdades

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **media-control** | | | | | | | | | | | | |
| media-regulation | | | | | | | | −5 | | | | mid −10 |
| strong-state-media | | | | | | | | −4 | | +0,3 | | mid +10, anc +1 |
| censorship | | | | | | | | −15 | +3 | | | mídia cativa (§3.6), anc +1, crev +0,1; bloqueia o evento `corruption-scoop` |
| state-information-monopoly | | | | | | | | −20 | +3 | | | mídia leal (§3.6), anc +2, crev +0,1 |
| **surveillance** | | | | | | | | | | | | |
| public-cameras | | | | −2 | | | | −1 | | +0,1 | | |
| internet-monitoring | | | | −1 | | | | −4 | | | | rev −2 |
| mass-surveillance | | | | −2 | | | | −7 | | | | rev −3, ate×0,7, crev −0,3; rebeldes crescem ×0,5; atentado fatal −10 pp |
| thought-police | | | | | | −1 | | −10 | | | | rev −5, mil −5, crev −1,0 |

### Poder e regime

| Nó | PIB | Des | Inf | Crime | Saú | Edu | Pol | Imp | Corr | Dív/s | Dív 1× | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **authoritarianism** | | | | | | | | | | | | |
| state-of-emergency | | | | | | | | −3 | | | | mil +10, gol −1 |
| rule-by-decree | | | | | | | | | +2 | | | mid −10 |
| judiciary-control | −0,2 | | | | | | | −3 | +5 | | | mid −10 |
| congress-dissolution | | | | | | | | −4 | +3 | | | mil +5, gol +2, crev +0,1 |
| election-postponement | −0,2 | | | | | | | −3 | | | | gol +1, crev +0,2 |
| end-of-elections | −0,3 | | | | | | | −5 | +4 | | | gol +3, anc +2, crev +0,2 |
| **monarchy** | | | | | | | | | | | | |
| lifetime-title | | | | | | | | | +2 | | | crev +0,1 |
| new-constitution | | | | | | | | −2 | | | | gol −2, rev −2 |
| coronation | | | | | | | | | +2 | | +1,5 | mil −10, gol +2, anc +2 |
| succession | | | | | | | | | +1 | | | gol −4, rev −3, anc +1 |
| **personality-cult** | | | | | | | | | | | | |
| government-propaganda | | | | | | | | −2 | | +0,2 | | mid +5, anc +2 |
| leader-holiday | −0,1 | | | | | | | | | | | anc +2 |
| mandatory-portraits | | | | | | | | −2 | | +0,2 | | anc +2 |
| history-rewrite | | | | | | −3 | | −5 | | | | anc +3, rev −2 |

Efeitos de regime sobre eleições (adiamento, fim, título vitalício, sucessão) são lógica de regime
(S4), não desta tabela.

### 2.1 Leitura de equilíbrio (por que nenhuma árvore domina)

- **Livre mercado** dá o maior PIB e conserta a dívida, mas derruba saúde/educação, sobe crime e
  aumenta `poor` (o grupo que mais sofre). **Estatização** derruba desemprego e (no nó 2) a inflação,
  mas corrói PIB e corrupção e cria dívida; ninguém "gosta" dela: o ganho político vem dos
  indicadores (desemprego/inflação → trabalhadores, jovens, pobres, aposentados).
- **Saúde/educação públicas** são caras (+1,7 e +1,8 Dív/s completas) e só se pagam devagar via
  acoplamentos (educação → PIB e crime; saúde → PIB). Precisam de imposto alto ou de dívida.
- **Repressão** (polícia secreta, controle da mídia, autoritarismo, culto) compra estabilidade
  concreta: riscos de revolução negativos, mídia cativa, âncora de apoio maior, escândalos abafados.
  O preço é indireto e crescente: imprensa baixa → corrupção sobe (§3.3) → PIB cai; revolucionários
  crescem (`crev`) → atentado; golpe passa a ser a principal ameaça; sanções internacionais.
- **Armamento civil** piora crime, mas milícias são contrapeso ao Exército (gol −5) e à revolução.

---

## 3. Camada de movimento

Ordem de execução no fim de cada semestre (função pura `endSemester(state, rng)`):

1. Aplicar ações da fila (ativar nós; mudar `taxRate`; `Dív 1×`; efeitos `tam` "na ativação";
   reação likes/dislikes ±4 já existente).
2. Calcular `deslocamentoPolíticas` (soma das tabelas §2 + §1.4).
3. Atualizar `base` dos 9 indicadores de nível (§3.1–3.3), usando os valores **exibidos do semestre
   anterior** nos acoplamentos.
4. Atualizar `debt` (§3.4).
5. Atualizar nível de recessão (§3.4) e calcular `exibido`.
6. Tamanhos de grupos (`tam`, pobres §3.5); apoio dos grupos (§3.5); aprovação.
7. Humores de mídia e Forças Armadas (§3.6).
8. Revolucionários e rebeldes (§3.8).
9. Sortear e aplicar eventos (§4). Recalcular `exibido`, apoio, aprovação e humores.
10. Calcular e rolar riscos na ordem atentado → revolução → golpe (§3.7). Fim de jogo, se for o caso.
11. Atualizar flag de crise (§3.9) e decair modificadores temporários (§4.5).

### 3.1 Fórmula da base

Para cada indicador de nível `i`:

```
base_i(t) = base_i(t−1)
          + κ_i × (alvo_i − base_i(t−1))                 // reversão ao alvo (acoplamentos)
          + μ_i × (base_i(t−1) − base_i(t−2))            // momento amortecido
          + σ_i × (1 + instabilidade) × N(0,1)           // ruído (RNG com seed, Box-Muller)
          + choquesDeEventos_i                            // §4.5
```

| Indicador | κ (reversão) | μ (momento) | σ (ruído) |
|---|---|---|---|
| gdp | 0,25 | 0,3 | 0,35 |
| unemployment | 0,20 | 0,3 | 0,25 |
| inflation | 0,20 | 0,3 | 0,40 |
| crime | 0,15 | 0,2 | 1,0 |
| health | 0,15 | 0,2 | 0,6 |
| education | 0,10 | 0,2 | 0,4 |
| pollution | 0,10 | 0,2 | 0,6 |
| pressFreedom | 0,15 | 0,2 | 0,5 |
| corruption | 0,10 | 0,2 | 0,8 |

O sistema é estável (raízes < 1 para todos os pares κ/μ acima). Políticas não entram no momento:
só choques, ruído e acoplamentos têm inércia, por isso o efeito de um nó é exatamente o da tabela.

### 3.2 Instabilidade (escala do ruído)

```
instabilidade = min(2,
    0,02 × max(0, debt − 80)
  + 0,05 × max(0, inflation − 10)
  + 0,02 × max(0, crime − 50)
  + 0,02 × max(0, corruption − 50)
  + 0,25 × nívelRecessão)
```

### 3.3 Alvos (acoplamentos entre indicadores)

Todos os termos usam valores **exibidos** do semestre anterior. `[x]` = 1 se verdadeiro.

```
alvo_gdp          = 2,0 − 0,08×max(0, inflation−8) − 0,04×max(0, corruption−40)
                        − 0,03×max(0, crime−50) + 0,03×(education−50) + 0,02×(health−50)
alvo_unemployment = 8 − 1,5×(gdp − 2,0)
alvo_inflation    = 4 + 0,06×max(0, debt−80) + 0,5×max(0, gdp−3,5)
                      − 0,25×max(0, unemployment−12) + 0,05×max(0, corruption−50)
alvo_crime        = 35 + 2,0×(unemployment−9) + 0,3×max(0, corruption−40)
                       − 0,25×(education−50)
alvo_health       = 50 − 0,25×max(0, pollution−55) − 0,5×max(0, −gdp) − 0,1×max(0, debt−120)
alvo_education    = 50 − 0,1×max(0, debt−120)
alvo_pollution    = 40 + 3×max(0, gdp)
alvo_pressFreedom = 60
alvo_corruption   = 35 + 0,5×max(0, 50−pressFreedom) + 0,1×max(0, crime−50)
                       + 5×[turnosSeguidosNoPoder ≥ 8] + 5×[turnosSeguidosNoPoder ≥ 16]
```

Pressão passiva que isso gera: poluição sobe com crescimento; corrupção sobe com tempo no poder;
imprensa amordaçada vira corrupção, que vira PIB menor; desemprego vira crime.

### 3.4 Dívida e recessão

**Dívida (estoque):**

```
déficitPrimário = 0,3                                  // estrutural a 30% de imposto
                + impostos[taxRate].Dív/sem
                + Σ nós ativos Dív/sem
                + 0,5 × nívelRecessão                  // arrecadação menor
                + 0,05 × tamanho(rebels)
juroReal        = 3 + 0,04×max(0, debt−80) + 0,05×max(0, corruption−50)
debt(t)         = clamp(0, 400, debt(t−1) + déficitPrimário
                  + debt(t−1) × (juroReal − gdp) / 200 + Σ Dív 1× + choques de evento)
```

Sem políticas, partindo de `unstable`: ≈ +0,7 pp/semestre (dívida ~90 em 10 anos). Pressão garantida.

**Nível de recessão (0–3):**

| Nível | Entra quando | Sai quando (histerese) |
|---|---|---|
| 1 (recessão leve) | debt ≥ 100 **ou** PIB pré-recessão < −2 | debt < 90 e PIB pré-recessão ≥ −2 |
| 2 (recessão) | debt ≥ 130 **ou** PIB pré-recessão < −5 | debt < 120 e PIB pré-recessão ≥ −5 |
| 3 (depressão) | debt ≥ 170 | debt < 160 |

"PIB pré-recessão" = `base_gdp + deslocamentoPolíticas_gdp` (sem o deslocamento de recessão, para
não travar em si mesma).

**Efeitos por nível `L`:**

- Deslocamento exibido: PIB −1,0×L; desemprego +1,5×L (o desemprego ainda sobe pelo alvo via PIB).
- Apoio de todos os grupos: −1×L por semestre.
- Déficit +0,5×L (acima). Risco de golpe +2×L. Revolucionários +0,3×L/sem.
- **L ≥ 2 ativa a flag de crise** e faz rebeldes crescerem (§3.8).
- Rebeldes: deslocamento exibido de crime +1,0 × tamanho(rebels); PIB −0,1 × tamanho(rebels).

### 3.5 Apoio dos grupos (pressão sobre aprovação)

Por semestre, para cada grupo não emergente:

```
apoio += reaçãoPolíticas (±4 por ação, já existe)
       + reaçãoIndicadores (tabela abaixo)
       + 0,08 × (âncora − apoio)
       + humorMídia {leal +1, neutro 0, crítico −1, hostil −2}
       − 1 × nívelRecessão
       + efeitos de eventos
âncora = clamp(30, 65, 45 − 2×(mandatosSeguidos − 1) + Σ anc dos nós ativos)
```

O termo `−2×(mandatosSeguidos − 1)` é o **desgaste de governo**: em 20 anos a âncora cai 8 pontos
(culto/propaganda compensam, por isso tentam).

| Grupo(s) | Reação por semestre |
|---|---|
| todos | +0,6 × clamp(gdp − 1,5; −4; +4) |
| workers | −0,5 × max(0, unemployment − 9) |
| youth | −0,4 × max(0, unemployment − 9) |
| poor | −0,3 × max(0, inflation − 8); −0,2 × max(0, 45 − health) |
| retirees | −0,4 × max(0, inflation − 6); −0,2 × max(0, 45 − health) |
| middle-class | −0,3 × max(0, inflation − 6); −0,25 × max(0, crime − 45) |
| business, rich | −0,3 × max(0, inflation − 10) |
| environmentalists | −0,3 × max(0, pollution − 55) |
| progressives | −0,1 × max(0, pollution − 55); −0,1 × max(0, 50 − pressFreedom) |
| progressives, youth, middle-class | −0,15 × max(0, corruption − 45) × clamp(pressFreedom/60; 0; 1) |

O último termo é uma tentação explícita: com imprensa amordaçada, o povo não fica sabendo da
corrupção.

**Tamanho de `poor`** (necessário para a utopia socialista): por semestre
`Δ = 0,1 × (unemployment − 8) + Σ tam dos nós`, clamp 5–60.

### 3.6 Humores dos atores

```
escoreMilitar = apoio(security-forces) + Σ mil dos nós + modsTemporários
              − 8×[debt ≥ 120] − 5×nívelRecessão
escoreMídia   = 50 + 0,5×(aprovação − 50) − 0,5×max(0, corruption − 35)
              + Σ mid dos nós + modsTemporários
```

Faixas (ambos): **≥ 55 leal · 40–54 neutro · 25–39 crítico · < 25 hostil**.

- `censorship` ativo: humor da mídia nunca abaixo de **neutro** (mídia cativa).
- `state-information-monopoly` ativo: humor da mídia é sempre **leal**.
- Humor da mídia multiplica os **efeitos negativos de eventos sobre apoio** (§4.5): leal ×0,6,
  neutro ×1,0, crítico ×1,2, hostil ×1,4.

### 3.7 Riscos (probabilidade por semestre, %)

**Atentado** (tentativa):

```
ate = (0,8 × tamanho(revolutionaries)
      + 1 por grupo não emergente com apoio < 15 e tamanho ≥ 5
      + Σ ate dos nós + mods de evento)
      × 0,7 por cada nó com ate×0,7 ativo        // secret-police, mass-surveillance
ate = clamp(0, 25)
```

Se a tentativa ocorre: **fatal** com probabilidade `max(10, 35 − 10 × nº de ativos entre
military-on-streets, secret-police, mass-surveillance)` %. Fatal = derrota. Não fatal = evento de
sistema `attack-foiled` (§5.2).

**Revolução** (só se `tamanho(revolutionaries) ≥ 5`):

```
rev = (1,5 × (tamanho(revolutionaries) − 5) + 0,3 × max(0, 35 − aprovação)
      + 0,5 × tamanho(rebels) + Σ rev dos nós + mods de evento)
      × {leal 0,5 · neutro 1,0 · crítico 1,3 · hostil 1,6}   // humor militar
rev = clamp(0, 40)
```

**Golpe** (sucesso):

```
gol = {leal 0 · neutro 0 · crítico 4 · hostil 12}             // humor militar
    + 0,4 × max(0, 35 − aprovação) + 2 × nívelRecessão
    + 0,5 × tamanho(rebels) + Σ gol dos nós + mods de evento
gol = clamp(0, 50); se militar leal, gol = min(gol, 3)
```

O relatório do semestre mostra `ate` (tentativa), `rev` e `gol` (sucesso) e `rebels` = tamanho atual.

### 3.8 Grupos emergentes

```
Δrevolutionaries = Σ crev dos nós
                 + 0,5×[aprovação < 30] + 0,3×nívelRecessão + 0,3×[unemployment > 15]
                 + efeitos de evento − 0,3×[aprovação > 55] − 0,2
revolutionaries  = clamp(0, 20)

Δrebels = { L ≤ 1: −0,5 ; L = 2: +0,5 ; L = 3: +1,0 }
        × (0,5 se military-on-streets ou mass-surveillance ativo, quando Δ > 0)
rebels  = clamp(0, 15)
```

Apoio de ambos é sempre `null` (não entram na aprovação). Primeira vez que `rebels > 0`: evento de
sistema `rebels-emerge`.

### 3.9 Flag de crise

Crise ativa se: `nívelRecessão ≥ 2`, **ou** um evento com `crise` ocorreu neste semestre ou no
anterior, **ou** houve `attack-foiled` neste semestre ou no anterior. Usos: desconto de 30% em
Segurança/Poder (S3) e pré-requisito de `state-of-emergency` (S4: "crise **ou aprovação ≥ 60**").

---

## 4. Sistema de eventos

### 4.1 Quantidade por semestre

Rolagem com o RNG: **1 evento (35%) · 2 eventos (45%) · 3 eventos (20%)**, média 1,85. **Nunca
zero.** Igual em turnos de eleição. A revelação de figura histórica do nó (`GameEvent` atual) é à
parte e não conta. No máximo **1 evento `marcante` com imagem** por semestre (se sair mais de um,
o de maior peso mostra a imagem; os outros só texto).

### 4.2 Peso

Cada evento tem uma lista de **gatilhos** `{ condições[], peso }`. Peso efetivo:

```
peso = max(peso dos gatilhos cujas condições (AND) são todas verdadeiras)   // 0 se nenhum
     × escala            // opcional: min(3, 1 + |valor − limiar| / faixa) para gatilhos de indicador
     × multiplicadores   // opcionais, listados no catálogo (ex.: ×1,5 se Imp > 40)
     × fresco            // (1 + 0,5 × profundidade) se algum nó do gatilho foi ativado neste semestre
     × antimonotonia     // ×1,5 para eventos positivos se nenhum positivo saiu nos últimos 2 semestres
```

Condições possíveis (tipo `Condition` em `game-content`): nó ativo; `taxRate` ≥/≤; indicador >/<;
aprovação >/<; apoio de grupo <; humor militar ∈ {...}; nível de recessão ≥; `sempre`.

### 4.3 Sorteio, cooldown e repetição

- Sorteio ponderado **sem reposição** com o RNG da partida (determinístico por seed).
- Um evento não pode sair se saiu há menos de `cooldown` turnos (padrão 6). `único` = uma vez por
  partida.
- Nunca o mesmo evento duas vezes no semestre.
- Se houver menos elegíveis do que o sorteado, sai o que houver (mínimo 1). Se nenhum for elegível
  (praticamente impossível: há 8 eventos "sempre"), ignora-se o cooldown dos eventos "sempre".

### 4.4 Escolhas do jogador (decisão: SIM no MVP)

- **12 dos 45 eventos** têm escolha com **exatamente 2 opções** (A e B). Os demais são só notícia.
- O efeito **base** do evento aplica-se no sorteio (fim do semestre). A escolha é resolvida no
  **início do turno seguinte**, antes das ações: não consome ação nem capital (a não ser que a opção
  custe capital, campo `capital`; se faltar capital, a opção fica desabilitada).
- Se o jogador encerrar o turno sem escolher, aplica-se a **opção A** (padrão).
- Motor: `state.pendingChoices: { eventId, turn }[]` + função pura
  `resolveEventChoice(state, eventId, option)`. Riscos modificados por opção valem para a rolagem do
  semestre corrente.

### 4.5 Como eventos afetam o jogo

Esquema `EventEffects` (mesmo para efeito base e para opções):

| Campo | Efeito |
|---|---|
| `indicators` | **choque na base** (decai por reversão, tem momento). `debt` soma direto no estoque. |
| `groups` | delta de apoio por grupo (negativos multiplicados pelo humor da mídia, §3.6) |
| `all` | delta de apoio para todos os grupos não emergentes (idem) |
| `sizes` | delta de tamanho de grupo, pp de população (inclui `revolutionaries`, `rebels`) |
| `media`, `military` | modificador temporário de escore; **decai 50% por semestre** |
| `risks` | pp somados ao risco **do semestre corrente** (só vale uma rolagem) |
| `capital` | soma/subtrai capital político |
| `crisis` | liga a flag de crise (§3.9) |

### 4.6 Textos (i18n)

- `event.<id>.title`: manchete, até ~70 caracteres, tom de jornal sóbrio.
- `event.<id>.body`: 1–2 frases.
- `event.<id>.option.a` / `event.<id>.option.b`: rótulo do botão, até ~40 caracteres.
- Interpolação disponível: `{{country}}`, `{{president}}`.
- Eventos `marcante` usam a imagem `assets/events/<id>` (sóbria; S6).
- A UI mostra as consequências numéricas (deltas) calculadas pelo motor, não texto fixo.

Tipo novo em `shared-types`: `CountryEvent { id; turn; option?: "a" | "b"; pending: boolean }`;
`SemesterReport` ganha `events: CountryEvent[]`.

---

## 5. Catálogo de eventos (45)

Legenda: gatilhos "nó (peso)"; alternativas separadas por `;` (vale a de maior peso). `cd` =
cooldown em turnos. Siglas de efeito como em §2; grupos pelo id; "todos" = `all`; `mid`/`mil` =
modificadores temporários; `rev`/`reb` = tamanho de revolucionários/rebeldes; `gol`/`ate`/`rv` =
risco no semestre; `cap` = capital. (+) positivo · (−) negativo · (=) misto. ★ = marcante (imagem).
⚑ = crise.

### Segurança (9)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha A / B |
|---|---|---|---|---|---|---|
| 1 | `buyback-record` | + | gun-buyback (4) | 8 | Crime −2; progressives +3, middle-class +2, gun-owners −3; mid +5 | — |
| 2 | `school-shooting` ★ | − | free-carry (5); legal-militias (7) | 6 | Crime +2; todos −1, progressives −5, middle-class −3; mid −10 | **A** "Decretar luto e defender o porte": gun-owners +4, agribusiness +2, progressives −4. **B** "Anunciar regras de armazenamento": cap −10, Crime −1, gun-owners −6, progressives +3, middle-class +2 |
| 3 | `militia-takes-district` | − | legal-militias (6) | 6 | Crime +4, Corr +2; poor −5, middle-class −3; mil −10 | — |
| 4 | `military-abuse-viral` | − | military-on-streets (5); ×1,5 se Imp > 40 | 6 | youth −5, progressives −5, poor −3; mid −10 | **A** "Defender as tropas": security-forces +6, mil +10, youth −3, progressives −3. **B** "Afastar o comandante": security-forces −6, mil −10, mid +10, progressives +3 |
| 5 | `wrongful-execution` ★ | − | death-penalty (4) | 10 | todos −1, progressives −6, religious −4; mid −15; rev +0,5 | — |
| 6 | `journalist-disappears` | − | opposition-surveillance (5); arrest-opponents (7) | 6 | Imp −2; progressives −5, youth −3; mid −15; rev +0,5 | — |
| 7 | `organized-crime-wave` | − | Crime > 55 (3); escala Crime, faixa 15 | 4 | Crime +3, PIB −0,2; middle-class −4, business −2 | — |
| 8 | `coup-rumors` | − | humor militar crítico ou hostil (5) | 4 | gol +3 | **A** "Expurgar oficiais suspeitos": gol −6, security-forces −8, Imp −1. **B** "Reajustar os soldos": Dív +1,5, mil +15, security-forces +5 |
| 9 | `police-strike` | − | apoio(security-forces) < 35 (4); Dív > 120 (4) | 6 | Crime +3; middle-class −3 | **A** "Conceder reajuste": Dív +1, security-forces +8, mil +5. **B** "Descontar os dias parados": Crime +2, security-forces −6, mil −5 |

### Economia (9)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 10 | `shortages` | − | price-controls (6) | 4 | Inf +1,0, PIB −0,3; poor −4, middle-class −4, retirees −2 | — |
| 11 | `capital-flight` | − | taxRate ≥ 60 (4); sector-nationalization (5); end-private-property (7) | 6 | PIB −0,6, Des +0,4, Dív +2; business −5, rich −6; tamanho rich −0,3 | — |
| 12 | `investment-boom` | + | taxRate ≤ 20 (3); privatizations (4); deregulation (4); ×0,5 se Corr > 55 | 6 | PIB +0,6, Des −0,4; business +5, rich +3, youth +2 | — |
| 13 | `credit-downgrade` | − | Dív > 90 (4); escala Dív, faixa 40 | 6 | Dív +2, PIB −0,3, Inf +0,5; business −4, middle-class −2; mid −5 | — |
| 14 | `currency-crisis` ★⚑ | − | Inf > 15 (4); Dív > 130 (4) | 8 | Inf +4, PIB −0,6; todos −2, retirees −4, middle-class −3 | — |
| 15 | `commodity-boom` | + | sempre (1); qualquer nó de exploitation (2) | 8 | PIB +0,8, Des −0,3, Dív −2; agribusiness +5 | — |
| 16 | `commodity-crash` | − | sempre (1); qualquer nó de exploitation (2) | 8 | PIB −0,8, Des +0,3, Dív +2; agribusiness −5, workers −2 | — |
| 17 | `global-recession` ⚑ | − | sempre (0,8) | 12 | PIB −1,0, Des +0,6; todos −1 | — |
| 18 | `good-harvest` | + | sempre (2) | 4 | Inf −0,8, PIB +0,2; agribusiness +4, poor +2 | — |

### Trabalho (2)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 19 | `general-strike` ★ | − | labor-reform (4); Inf > 12 (4); end-minimum-wage (5); strike-ban (5) | 6 | PIB −0,5; business −3, middle-class −2 | **A** "Negociar com as centrais": cap −10, Inf +0,5, workers +6, retirees +2, business −4. **B** "Dispersar os piquetes": Imp −2, workers −8, youth −4, security-forces +3, mil +5, rev +0,5 |
| 20 | `union-agreement` | + | minimum-wage-raise (4); ×0,5 se Inf > 10 | 8 | Inf +0,2, PIB +0,1; workers +5, business −1 | — |

### Saúde (3)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 21 | `hospital-queue-scandal` | − | private-partnerships (4); Saú < 45 (4, escala Saú, faixa 15) | 4 | Saú −1; poor −5, retirees −5; mid −5 | — |
| 22 | `epidemic` ★⚑ | − | sempre (0,5); Saú < 40 (3, escala Saú, faixa 15) | 10 | Saú −5, PIB −0,5; todos −1 | **A** "Decretar quarentena": PIB −0,6, Saú +3, business −5, youth −3, retirees +3. **B** "Manter tudo aberto": Saú −4, retirees −6, poor −3, business +3 |
| 23 | `medical-breakthrough` | + | public-network-expansion (3); Saú > 65 (3) | 8 | Saú +3; retirees +4, poor +2; mid +5 | — |

### Educação (2)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 24 | `school-ranking-record` | + | free-university (4); Edu > 65 (4) | 6 | Edu +2; youth +4, middle-class +2; mid +5 | — |
| 25 | `student-protests` | − | Edu > 60 e Imp < 40 (3); state-indoctrination (5); party-youth (6) | 4 | youth −5, progressives −3 | **A** "Receber os estudantes": cap −10, youth +4. **B** "Dispersar os protestos": Imp −2, youth −6, security-forces +3, rev +1; mid −10 |

### Costumes (4)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 26 | `religious-march` | = | same-sex-marriage (3); legal-abortion (5); all-drugs-legalization (5) | 6 | religious −4, nationalists −2, progressives +2 | — |
| 27 | `overdose-crisis` | − | all-drugs-legalization (5) | 6 | Saú −3, Crime +1; middle-class −4, religious −4, retirees −2 | — |
| 28 | `morality-police-incident` ★ | − | official-religion (2); religious-law (6) | 6 | Imp −2; youth −6, progressives −8, religious +3; rev +0,5; mid −10 | — |
| 29 | `casino-laundering-scandal` | − | online-betting (2); casinos-allowed (5) | 6 | Corr +4; religious −5, middle-class −3; mid −5 | — |

### Meio ambiente (4)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 30 | `environmental-disaster` ★ | − | Pol > 65 (3); mining-in-reserves (5); end-environmental-laws (7) | 6 | Pol +5, Saú −2, PIB −0,2; environmentalists −8, progressives −3 | **A** "Multar e punir a empresa": cap −10, Corr −2, business −4, agribusiness −4, environmentalists +4. **B** "Minimizar o caso": Corr +2, environmentalists −5; mid −10 |
| 31 | `energy-crisis` ⚑ | − | mandatory-degrowth (4); end-fossil-fuels (6) | 6 | Inf +1,5, PIB −0,4; middle-class −3, business −3 | **A** "Ligar termelétricas de emergência": Pol +4, environmentalists −6, progressives −2. **B** "Decretar racionamento": PIB −0,5, business −4, middle-class −2, environmentalists +2 |
| 32 | `climate-award` | + | Pol < 30 (3); reserve-protection (4) | 8 | PIB +0,2; environmentalists +5, progressives +3; mid +5 | — |
| 33 | `natural-disaster` ★⚑ | − | sempre (1,5); Pol > 60 (3) | 6 | PIB −0,4, Saú −2, Dív +1,5; todos −1, poor −3 | — |

### Imigração (2)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 34 | `migration-wave` | = | easier-visas (1,5); open-borders (5) | 6 | PIB +0,2, Des +0,3; tamanho immigrants +1; nationalists −6, immigrants +4, workers −2 | — |
| 35 | `labor-shortage` | − | immigration-quotas (2); mass-deportation (6) | 6 | PIB −0,4, Inf +0,5; agribusiness −6, business −4 | — |

### Imprensa e liberdades (2)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 36 | `hacker-leak` | − | internet-monitoring (4); censorship (4); ×1,5 se thought-police | 6 | Imp +2; todos −1, youth −4, progressives −3; mid −10 | — |
| 37 | `corruption-scoop` | − | Corr > 50 (4; escala Corr, faixa 20); **nunca** com censorship ativo | 4 | middle-class −4, youth −3, progressives −3; mid −10 | **A** "Demitir o ministro": cap −10, Corr −3, middle-class +2. **B** "Negar tudo": Corr +1, todos −1; mid −10 |

### Poder e regime (6)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 38 | `judges-resign` | − | judiciary-control (5) | único | PIB −0,2, Imp −2, Corr +2; progressives −5, business −3; mid −10 | — |
| 39 | `leader-statue-toppled` ★ | − | mandatory-portraits e aprovação < 40 (6) | 6 | todos −1, nationalists −3; rev +1; mid −5; gol +2 | — |
| 40 | `mass-rally` | + | government-propaganda e aprovação > 50 (4); mandatory-portraits e aprovação > 50 (5) | 4 | todos +1, nationalists +4; mid +5 | — |
| 41 | `palace-intrigue` | − | succession (2); coronation (4) | 6 | Corr +1; mil −10; gol +3 | — |
| 42 | `international-sanctions` ★ | − | arrest-opponents (2); mass-deportation (4); torture (5); end-of-elections (5); opponent-assassination (6) | 8 | PIB −0,6, Inf +0,5, Dív +1; business −4, rich −3, nationalists +3 | **A** "Desafiar as potências": PIB −0,3, nationalists +4, progressives −3. **B** "Libertar presos políticos": PIB +0,4, rev +1, nationalists −3, security-forces −4; mid +5 |
| 43 | `mass-protests` ★ | − | aprovação < 30 (4); rule-by-decree e aprovação < 45 (4); ×1,5 se state-of-emergency | 4 | Crime +2; todos −1; rev +1 | **A** "Fazer concessões": cap −15, todos +2. **B** "Reprimir as manifestações": Imp −3, security-forces +4, rev +1,5, mil +5; mid −10 |

### Estado do país, sem política (2)

| # | id | Tom | Gatilhos (peso) / mult. | cd | Efeitos base | Escolha |
|---|---|---|---|---|---|---|
| 44 | `sports-victory` | + | sempre (1,5) | 10 | todos +2, nationalists +2 | — |
| 45 | `infrastructure-collapse` | − | sempre (0,8); Dív > 100 (2,5); minimal-state (3) | 6 | Saú −1, PIB −0,2, Corr +1; todos −2; mid −5 | — |

Resumo: 10 positivos, 2 mistos, 33 negativos; 12 com escolha (2, 4, 8, 9, 19, 22, 25, 30, 31, 37,
42, 43); 8 têm gatilho "sempre" (15, 16, 17, 18, 22, 33, 44, 45); todas as 25
árvores disparam ao menos um evento (impostos via 11/12).

### 5.2 Eventos de sistema (gerados pelo motor, não sorteados)

Mesmo formato de i18n (`event.<id>.title/.body`), não contam na cota do semestre:

| id | Quando | Efeito |
|---|---|---|
| `attack-foiled` ★⚑ | tentativa de atentado não fatal | todos +3 (comoção); mid +10; crise por 2 semestres |
| `attack-fatal` ★ | tentativa fatal | derrota |
| `coup` ★ | rolagem de golpe | derrota |
| `revolution` ★ | rolagem de revolução | derrota |
| `rebels-emerge` | primeira vez que rebels > 0 | só notícia |
| `recession-starts` / `recession-ends` | nível de recessão sobe de 0 / volta a 0 | só notícia |

---

## 6. Respostas às decisões em aberto do rascunho

1. **Eventos com escolha?** **Sim no MVP**: 12 de 45, sempre 2 opções, resolvidos no início do turno
   seguinte, opção A por padrão (§4.4). Motivo: escolha transforma azar em decisão e é o antídoto
   mais barato contra monotonia; o custo de implementação é um campo `pendingChoices` e uma função
   pura.
2. **Frequência:** 1/2/3 eventos com 35/45/20% (média 1,85), nunca zero, cooldown padrão 6 (§4.1).
3. **Roteiro §5 item 33 — novo texto:**
   > 33. **Eventos e crises:** acontecem **todo semestre** (de 1 a 3), puxados principalmente pelas
   > políticas ativas e pelo estado do país. Mesmo sem novas políticas o país se move e algo
   > acontece. Alguns eventos pedem uma decisão entre duas respostas.

   Outros ajustes de texto no roteiro:
   - §2 item 13, acrescentar: "Subir ou baixar a intensidade é ajuste, não desfazer: o presidente em
     exercício pode mexer nos dois sentidos."
   - §3 item 19, acrescentar: "O motor aplica o impacto total no fim do semestre; 'mais radical, mais
     imediato' aparece na animação e em consequências (eventos) já no semestre da ativação."
   - S4 item 1: "aprovação alta" = **aprovação ≥ 60**.
4. **Impostos:** começa em **30%** (taxes-20 e taxes-30 ativos, herdados). Baixar **não** depende da
   issue #16: ajuste de intensidade nos dois sentidos é permitido ao presidente em exercício (§1.4).
5. **Repressão mexe pouco no PIB direto:** **confirmado**, mas o PIB paga por canais indiretos que
   escalam: Imp baixa → alvo de corrupção sobe (+0,5 por ponto abaixo de 50) → alvo de PIB cai
   (−0,04 por ponto acima de 40); sanções internacionais; insegurança jurídica nos nós de
   autoritarismo (judiciary-control, election-postponement, end-of-elections: −0,2/−0,2/−0,3).

### 6.6 Achados extras (precisam de decisão de dado/motor mínima)

- **Conflito `casino-ban` × `casinos-allowed`**: estão em árvores não opostas e podem coexistir.
  Decisão: bloqueio mútuo entre esses dois nós via a mesma tabela de pré-requisitos extras já usada
  para monarquia (`EXTRA_PREREQS` no mock), como par exclusivo. Sem nova abstração.
- **Indicadores de utopia sem indicador no jogo** (para a issue #17), proxies finais:
  - *1984*: pressFreedom ≤ 5 e revolutionaries < 1.
  - Socialista ("desigualdade mínima"): tamanho(poor) ≤ 15 e unemployment ≤ 5.
  - Anarcocapitalista: taxRate = 0, gdp ≥ 5 e crime ≤ 30.
  - Teocracia: religious é o grupo de maior tamanho e apoio(religious) ≥ 70.
  - Tecnocracia: pollution ≤ 15, education ≥ 65 e health ≥ 65.
  - (+ árvores completas + 4 turnos seguidos sem golpe/revolução/atentado bem-sucedido, S5.)

---

## 7. Notas de calibragem (o que vigiar no playtest)

Rodar simulações headless com seeds fixas (bot passivo, bot "livre mercado", bot "estado social",
bot "ditador") por 80 turnos e acompanhar:

1. **Jogador passivo**: deve terminar 20 anos com dívida ~95–110, corrupção ~45, aprovação 40–48 e
   ao menos 1 recessão leve. Se ficar confortável demais: subir déficit estrutural (0,3 → 0,5) ou o
   desgaste (−2 → −3 por mandato).
2. **Taxa de golpe em democracia normal** (militar neutro, aprovação 40–50): alvo < 5% de golpes em 80
   turnos. Se passar, baixar o coeficiente de aprovação (0,4).
3. **Ditador**: alvo de ~50% de queda/morte em 20 semestres após completar polícia secreta +
   controle da mídia. Os parâmetros mais sensíveis: `crev` da polícia secreta (soma 1,0), 0,8 ×
   revolucionários no atentado e a chance fatal (35%).
4. **Livre mercado é o candidato a árvore dominante** (PIB +2,2 e conserta dívida). Se dominar,
   aumentar `minimal-state` Saú/Edu para −8 ou o `tam` de `poor`.
5. **Saúde/educação públicas** podem parecer inúteis por serem caras: se ninguém as escolher, baixar
   Dív/s em 0,1 por nó ou subir os coeficientes de educação/saúde no alvo do PIB (0,03/0,02).
6. **Eventos**: medir a fração de semestres em que só saem eventos "sempre" (alvo < 30% para
   jogadores ativos) e a repetição percebida (nenhum evento > 6 vezes em 80 turnos).
7. **Teocracia**: crescer `religious` de 28 para > 41 (`workers`) leva ~28 semestres; se for
   impossível na prática, subir `tam` de religious-law para +0,5.
8. **Partida em `crisis`**: a dívida sobe ~3 pp/semestre no começo; checar que a recessão nível 1 em
   ~2 semestres não leva a derrota quase certa antes da primeira eleição.
