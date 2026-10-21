# Decreto: Final Specification of Effects, Simulation Movement, and Events (v2)

> Complements `game-design.md` (the design source of truth) with effect, simulation movement,
> and event values. All numbers here are **final for the MVP**:
> implement them as written and adjust only after playtesting (see §7).
> Node, tree, and group IDs exactly match those in `policy-trees.ts` and `voter-groups.ts`.
> Everything in the tables is **data** (`packages/game-content`); formulas belong to the **engine**
> (`packages/game-engine`, pure functions, seeded RNG).

---

## 1. Conventions

### 1.1 Indicators, units, and limits

| ID | Unit | Range (clamp) | Type |
|---|---|---|---|
| `gdp` | annualized real growth, % | −15 to +15 | rate (level) |
| `unemployment` | % of the labor force | 1 to 45 | level |
| `inflation` | % per year | −5 to 300 | level |
| `debt` | % of GDP | 0 to 400 | **stock** (accumulates) |
| `crime`, `health`, `education`, `pollution`, `pressFreedom`, `corruption` | index 0–100 | 0 to 100 | level |

Values are stored at full precision; the UI rounds to one decimal place.

### 1.2 Base + offsets (the entire model in one line)

For the 9 level indicators:

```
displayed = clamp(base + policyOffset + recessionOffset + rebelOffset)
```

- **`base`**: the "country without policies." This is what moves on its own (trend, noise, coupling,
  event shocks); see §3.
- **`policyOffset`**: sum of the effects of **all active nodes** + the tax table row. A node effect is
  a **level while active**: it does not accumulate each semester and disappears if another president
  undoes the node. Table values are **incremental** (node N adds to node N−1).
- **`debt`** is the exception: it is a stock. Nodes have two debt fields:
  - **Debt/semester**: added to the primary deficit **each semester** the node is active (percentage points of GDP).
  - **One-time debt**: added **once**, in the activation semester (privatization, compensation, construction).
- "Effects can be modified by other policies" (design document §3.19) means the sum of effects plus
  indicator coupling (§3.3). The MVP has **no pairwise interaction table**.

### 1.3 Ramp ("more radical = more immediate")

Decision: the engine applies **100% of the effect at the end of the activation semester** (a literal
reading of the design document §3.19: "reaches full impact by the end of the semester"). The ramp is:

1. **UI animation only**: the value grows along the curve `t^k`, `k = max(1,2; 3 − 0,4 × (depth − 1))`.
2. **Event weight in the activation semester**: events triggered by a newly activated node have weight
   × `(1 + 0.5 × depth)` (see §4.2). Radicalism therefore has an immediate visible consequence.

### 1.4 Taxes (the `taxes` intensity tree)

- State is stored as `taxRate ∈ {0, 10, 20, 30, 40, 50, 60, 70}`. Nodes `taxes-20` … `taxes-70`
  are derived (`taxes-X` active ⇔ `taxRate ≥ X`); 0% and 10% have no node.
- **Initial state: 30%** (`taxes-20` and `taxes-30` active, inherited: they do not count as player
  policies, reveal a historical figure, or count in the final comparison).
- **Raising or lowering is an intensity adjustment, not an undo**: the sitting president can move
  in either direction (design document §2.13 and S3). Cost: `10 × (1 + jump in 10% increments)`. Counts as 1 action.
- Group reaction: raising = `taxes` "dislike" (business, poor, middle-class, rich −4 per
  action); **lowering = the inverse "like"** (+4 for the same groups).
- Effects by tax rate (absolute, relative to 30% = zero):

| taxRate | GDP | Unemployment | Health | Education | Crime | Corruption | Debt/semester |
|---|---|---|---|---|---|---|---|
| 0 | +1,0 | −0,6 | −5 | −5 | +3 | | +2,6 |
| 10 | +0,7 | −0,4 | −3 | −3 | +2 | | +1,8 |
| 20 | +0,35 | −0,2 | −1,5 | −1,5 | +1 | | +0,9 |
| 30 | | | | | | | |
| 40 | −0,3 | +0,2 | +1,5 | +1,5 | | | −0,8 |
| 50 | −0,7 | +0,5 | +3 | +3 | −1 | +1 | −1,5 |
| 60 | −1,2 | +0,9 | +4 | +4 | −1 | +2 | −2,0 |
| 70 | −1,8 | +1,4 | +5 | +5 | −1 | +3 | −2,3 |

(Revenue has diminishing returns above 50%: a simple Laffer curve.)

### 1.5 Initial state

Keep the current mock (`unstable`): gdp 1.8 · unemployment 9.4 · inflation 6.1 · debt 74 · crime 38 ·
health 52 · education 49 · pollution 44 · pressFreedom 58 · corruption 36. `stable` and `crisis` override these values as in the mock. On turn 1, `base = displayed` (there are no
active policies other than 30% taxes, whose offset is zero) and `base(t−2) = base(t−1)` (zero momentum).

### 1.6 Per-node modifiers (the tables’ "Mods" columns)

| Abbreviation | Meaning | Unit |
|---|---|---|
| `mil` | military mood (score) | points added to the military score (§3.6) |
| `mid` | media mood (score) | points added to the media score (§3.6) |
| `gol` / `ate` / `rev` | coup / assassination / revolution risk | percentage points added to the semester risk (§3.7) |
| `ate×0,7` | assassination protection | multiplier (stacks) |
| `crev` | revolutionaries growth | population percentage points per semester (§3.8) |
| `anc` | support anchor | points added to all groups’ support anchor (§3.5) |
| `tam` | group size | see each node note |

---

## 2. Effects for all 99 nodes

Empty cells = 0. "Debt/semester" = per semester; "Debt one-time" = once on activation.

### Security

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
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
| military-on-streets | | | | −5 | | | | −2 | +1 | +0,5 | | mil +10, rev −2; rebels grow ×0,5; fatal assassination −10 pp |
| life-sentence | | | | −2 | | | | | | +0,3 | | |
| death-penalty | | | | −3 | | | | −2 | | | | mil +5, mid −10, crev +0,1 |
| **secret-police** | | | | | | | | | | | | |
| secret-police | | | | | | | | −4 | +2 | +0,2 | | mil +5, gol −2, rev −2, ate×0,7; fatal assassination −10 pp |
| opposition-surveillance | | | | | | | | −6 | +1 | | | mid −10, rev −3, ate −1, crev +0,1 |
| arrest-opponents | | | | | | | | −10 | +2 | | | mid −15, rev −5, gol −1, crev +0,2 |
| torture | | | | −1 | | | | −6 | +3 | | | mid −15, rev −3, ate +2, crev +0,3 |
| opponent-assassination | | | | | | | | −8 | +3 | | | mid −20, mil −5, rev −6, ate +4, crev +0,4 |

### Economy

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **statization** | | | | | | | | | | | | |
| strategic-state-company | +0,2 | −0,5 | | | | | | | +2 | +0,3 | +3 | |
| price-controls | −0,4 | | −3,0 | | | | | | +1 | | | |
| sector-nationalization | −0,6 | −1,0 | | | | | | | +3 | +0,6 | +8 | |
| end-private-property | −2,0 | −2,5 | +4,0 | | | | | −5 | +5 | +1,0 | | mil −10, crev +0,2; tam: `rich` and `business` ×0,5 on activation |
| **free-market** | | | | | | | | | | | | |
| privatizations | +0,4 | +0,5 | | | | | | | +1 | −0,2 | −6 | |
| deregulation | +0,6 | | | | | | +3 | | +2 | | | |
| end-minimum-wage | +0,4 | −1,2 | −0,5 | +2 | −2 | | | | | | | crev +0,1; tam: `poor` +0,15/semester |
| minimal-state | +0,8 | | | +3 | −6 | −6 | | | | −1,5 | | mil −10; tam: `poor` +0,2/semester |
| **taxes** | see table §1.4 | | | | | | | | | | | |

### Labor

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **labor-rights** | | | | | | | | | | | | |
| minimum-wage-raise | | +0,3 | +0,5 | −1 | +1 | | | | | | | tam: `poor` −0,1/semester |
| shorter-workweek | −0,3 | −0,5 | | | +1 | | | | | | | |
| job-stability | −0,4 | −0,4 | +0,3 | | | | | | | | | |
| state-single-union | −0,3 | | | | | | | −3 | +3 | | | rev −2 |
| **flexibilization** | | | | | | | | | | | | |
| outsourcing | +0,3 | −0,3 | | | −1 | | | | | | | |
| labor-reform | +0,4 | −0,8 | | | | | | | | | | |
| end-payroll-taxes | +0,5 | −0,8 | | | | | | | | +0,8 | | |
| strike-ban | +0,3 | | | | | | | −4 | | | | crev +0,1 |

### Health

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **public-health** | | | | | | | | | | | | |
| public-network-expansion | | | | | +5 | | | | | +0,6 | | |
| free-medicines | | | | | +4 | | | | | +0,5 | | |
| fully-state-health | −0,2 | | | | +3 | | | | +2 | +0,6 | | |
| **private-health** | | | | | | | | | | | | |
| private-partnerships | +0,1 | | | | +2 | | | | +1 | −0,3 | | |
| health-vouchers | | | | | +1 | | | | +1 | −0,3 | | |
| end-public-health | +0,2 | | | | −9 | | | | | −1,2 | | crev +0,1; tam: `poor` +0,1/semester |

### Education

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **public-education** | | | | | | | | | | | | |
| school-meals-grants | | | | −1 | +1 | +3 | | | | +0,4 | | tam: `poor` −0,1/semester |
| free-university | | | | | | +4 | | | | +0,6 | | |
| mandatory-full-time-school | | | | −2 | | +4 | | | | +0,5 | | |
| single-state-school | | | | | | +1 | | −4 | +1 | +0,3 | | |
| **ideological-education** | | | | | | | | | | | | |
| civic-military-schools | | | | −1 | | +1 | | | | +0,1 | | mil +5 |
| single-national-curriculum | | | | | | −1 | | −1 | | | | anc +1 |
| state-indoctrination | | | | | | −3 | | −5 | | | | anc +2, rev −2, crev −0,1 |
| party-youth | | | | | | −2 | | −3 | | | | anc +2, rev −3, mil −5, crev −0,2 |

### Social issues

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **individual-liberties** | | | | | | | | | | | | |
| same-sex-marriage | | | | | | | | | | | | group reaction only (design decision: no indicator effect) |
| legal-abortion | | | | | +2 | | | | | | | |
| cannabis-legalization | | | | −2 | | | | | −1 | −0,3 | | |
| all-drugs-legalization | | | | −3 | −4 | | | | −2 | −0,2 | | |
| **conservatism** | | | | | | | | | | | | |
| casino-ban | | | | −1 | | | | | −1 | +0,2 | | blocks `casinos-allowed` (see §6.6) |
| abortion-ban | | | | | −3 | | | | | | | |
| official-religion | | | | −1 | | | | −2 | | | | anc +1; tam: `religious` +0,2/semester (teto 50) |
| religious-law | | | | −3 | | −3 | | −6 | | | | anc +2, rev −2, crev +0,1; tam: `religious` +0,3/semester (teto 50) |
| **gambling** | | | | | | | | | | | | |
| state-lottery | | | | | | | | | | −0,3 | | |
| online-betting | | | | | −1 | | | | +1 | −0,4 | | |
| casinos-allowed | +0,3 | | | +1 | | | | | +3 | −0,4 | | blocked by `casino-ban` |

### Environment

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
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

### Immigration

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **openness** | | | | | | | | | | | | |
| easier-visas | +0,2 | | | | | | | | | | | |
| immigrant-amnesty | +0,2 | | | | | | | | −1 | +0,2 | | tam: `immigrants` +0,1/semester (teto 15) |
| open-borders | +0,5 | +0,6 | | | −1 | | | | | +0,3 | | tam: `immigrants` +0,3/semester (teto 15) |
| **closure** | | | | | | | | | | | | |
| immigration-quotas | −0,1 | | | | | | | | | | | |
| border-wall | | | | −1 | | | | | +1 | +0,1 | +3 | |
| mass-deportation | −0,6 | | +0,6 | | | | | −3 | +1 | | +1,5 | crev +0,1; tam: `immigrants` ×0,5 on activation |

Design decision: **immigration does not affect crime** (to avoid stereotyping; its costs and benefits are
economic and political).

### Press and freedoms

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **media-control** | | | | | | | | | | | | |
| media-regulation | | | | | | | | −5 | | | | mid −10 |
| strong-state-media | | | | | | | | −4 | | +0,3 | | mid +10, anc +1 |
| censorship | | | | | | | | −15 | +3 | | | captive media (§3.6), anc +1, crev +0,1; blocks event `corruption-scoop` |
| state-information-monopoly | | | | | | | | −20 | +3 | | | loyal media (§3.6), anc +2, crev +0,1 |
| **surveillance** | | | | | | | | | | | | |
| public-cameras | | | | −2 | | | | −1 | | +0,1 | | |
| internet-monitoring | | | | −1 | | | | −4 | | | | rev −2 |
| mass-surveillance | | | | −2 | | | | −7 | | | | rev −3, ate×0,7, crev −0,3; rebels grow ×0,5; fatal assassination −10 pp |
| thought-police | | | | | | −1 | | −10 | | | | rev −5, mil −5, crev −1,0 |

### Power and regime

| Node | GDP | Unemployment | Inflation | Crime | Health | Education | Pollution | Press freedom | Corruption | Debt/semester | One-time debt | Mods |
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

Regime effects on elections (postponement, ending, life title, succession) belong to regime logic
(S4), not this table.

### 2.1 Balance analysis (why no tree dominates)

- **Free market** delivers the highest GDP and improves debt, but harms health/education, raises crime, and
  increases `poor` (the group most negatively affected). **Statization** lowers unemployment and
  (at node 2) inflation, but erodes GDP, increases corruption, and adds debt. No group "likes" it;
  its political benefit comes from indicator changes (unemployment/inflation → workers, youth, poor,
  retirees).
- **Public health/education** are expensive (+1.7 and +1.8 debt/semester when complete) and pay off
  slowly through coupling (education → GDP and crime; health → GDP). They require high taxes or debt.
- **Repression** (secret police, media control, authoritarianism, personality cult) buys concrete
  stability: lower revolution risk, captive media, a higher support anchor, and buried scandals. Its
  cost is indirect and increasing: lower press freedom → higher corruption (§3.3) → lower GDP;
  revolutionaries grow (`crev`) → assassination attempts; coups become the main threat; international sanctions.
- **Civil arms** worsen crime, but militias counterbalance the Army (coup −5) and revolution.

---

## 3. Simulation movement layer

Execution order at the end of each semester (pure function `endSemester(state, rng)`):

1. Apply queued actions (activate nodes; change `taxRate`; one-time debt; `tam` effects "on activation";
   existing likes/dislikes reaction ±4).
2. Calculate `policyOffset` (sum of tables §2 + §1.4).
3. Update `base` for the 9 level indicators (§3.1–3.3), using **displayed values from the previous
   semester** for coupling.
4. Update `debt` (§3.4).
5. Update the recession level (§3.4) and calculate displayed values.
6. Update group sizes (`tam`, poor §3.5); group support (§3.5); approval.
7. Update media and Armed Forces moods (§3.6).
8. Update revolutionaries and rebels (§3.8).
9. Draw and apply events (§4). Recalculate displayed values, support, approval, and moods.
10. Calculate and roll risks in this order: assassination → revolution → coup (§3.7). Check for end game.
11. Update the crisis flag (§3.9) and decay temporary modifiers (§4.5).

### 3.1 Base formula

For each level indicator `i`:

```
base_i(t) = base_i(t−1)
          + κ_i × (target_i − base_i(t−1))                // reversion to target (coupling)
          + μ_i × (base_i(t−1) − base_i(t−2))            // damped momentum
          + σ_i × (1 + instability) × N(0,1)              // noise (seeded RNG, Box-Muller)
          + eventShocks_i                                  // §4.5
```

| Indicator | κ (reversion) | μ (momentum) | σ (noise) |
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

The system is stable (roots < 1 for all κ/μ pairs above). Policies do not contribute momentum:
only shocks, noise, and coupling have inertia, so a node effect is exactly the value in the table.

### 3.2 Instability (noise scale)

```
instability = min(2,
    0,02 × max(0, debt − 80)
  + 0,05 × max(0, inflation − 10)
  + 0,02 × max(0, crime − 50)
  + 0,02 × max(0, corruption − 50)
  + 0.25 × recessionLevel)
```

### 3.3 Targets (coupling between indicators)

All terms use **displayed** values from the previous semester. `[x]` = 1 when true.

```
target_gdp          = 2,0 − 0,08×max(0, inflation−8) − 0,04×max(0, corruption−40)
                        − 0,03×max(0, crime−50) + 0,03×(education−50) + 0,02×(health−50)
target_unemployment = 8 − 1,5×(gdp − 2,0)
target_inflation    = 4 + 0,06×max(0, debt−80) + 0,5×max(0, gdp−3,5)
                      − 0,25×max(0, unemployment−12) + 0,05×max(0, corruption−50)
target_crime        = 35 + 2,0×(unemployment−9) + 0,3×max(0, corruption−40)
                       − 0,25×(education−50)
target_health       = 50 − 0,25×max(0, pollution−55) − 0,5×max(0, −gdp) − 0,1×max(0, debt−120)
target_education    = 50 − 0,1×max(0, debt−120)
target_pollution    = 40 + 3×max(0, gdp)
target_pressFreedom = 60
target_corruption   = 35 + 0,5×max(0, 50−pressFreedom) + 0,1×max(0, crime−50)
                       + 5×[consecutiveTermsInPower ≥ 8] + 5×[consecutiveTermsInPower ≥ 16]
```

Passive pressures created by this model: pollution rises with growth; corruption rises with time in power;
suppressed press freedom increases corruption, which lowers GDP; unemployment increases crime.

### 3.4 Debt and recession

**Debt (stock):**

```
primaryDeficit = 0.3                                 // structural at 30% tax
                + taxes[taxRate].debtPerSemester
                + Σ activeNodes.debtPerSemester
                + 0.5 × recessionLevel                 // lower revenue
                + 0.05 × size(rebels)
realInterest    = 3 + 0.04×max(0, debt−80) + 0.05×max(0, corruption−50)
debt(t)         = clamp(0, 400, debt(t−1) + primaryDeficit
                  + debt(t−1) × (realInterest − gdp) / 200 + Σ oneTimeDebt + eventShocks)
```

With no policies, starting from `unstable`: approximately +0.7 pp/semester (debt around 90 in 10 years). This creates steady pressure.

**Recession level (0–3):**

| Level | Starts when | Ends when (hysteresis) |
|---|---|---|
| 1 (mild recession) | debt ≥ 100 **or** pre-recession GDP < −2 | debt < 90 and pre-recession GDP ≥ −2 |
| 2 (recession) | debt ≥ 130 **or** pre-recession GDP < −5 | debt < 120 and pre-recession GDP ≥ −5 |
| 3 (depression) | debt ≥ 170 | debt < 160 |

"Pre-recession GDP" = `base_gdp + policyOffset_gdp` (excluding the recession offset to avoid a self-locking condition).

**Effects by level `L`:**

- Display offset: GDP −1.0×L; unemployment +1.5×L (unemployment also rises through its GDP-linked target).
- Support for all groups: −1×L per semester.
- Deficit +0.5×L (above). Coup risk +2×L. Revolutionaries +0.3×L/semester.
- **L ≥ 2 activates the crisis flag** and causes rebels to grow (§3.8).
- Rebels: displayed crime offset +1.0 × `size(rebels)`; GDP −0.1 × `size(rebels)`.

### 3.5 Group support (pressure on approval)

Each semester, for every non-emergent group:

```
support += policyReaction (±4 per action, already implemented)
       + indicatorReaction (table below)
              + 0.08 × (anchor − support)
              + mediaMood {loyal +1, neutral 0, critical −1, hostile −2}
              − 1 × recessionLevel
              + eventEffects
anchor = clamp(30, 65, 45 − 2×(consecutiveTerms − 1) + Σ activeNode.anc)
```

The term `−2×(consecutiveTerms − 1)` is **government fatigue**: after 20 years the anchor drops by 8 points
(personality cult/propaganda offset it, which is why they are attempted).

| Group(s) | Reaction per semester |
|---|---|
| all | +0.6 × clamp(gdp − 1.5; −4; +4) |
| workers | −0.5 × max(0, unemployment − 9) |
| youth | −0.4 × max(0, unemployment − 9) |
| poor | −0,3 × max(0, inflation − 8); −0,2 × max(0, 45 − health) |
| retirees | −0,4 × max(0, inflation − 6); −0,2 × max(0, 45 − health) |
| middle-class | −0,3 × max(0, inflation − 6); −0,25 × max(0, crime − 45) |
| business, rich | −0,3 × max(0, inflation − 10) |
| environmentalists | −0,3 × max(0, pollution − 55) |
| progressives | −0,1 × max(0, pollution − 55); −0,1 × max(0, 50 − pressFreedom) |
| progressives, youth, middle-class | −0,15 × max(0, corruption − 45) × clamp(pressFreedom/60; 0; 1) |

The final term encodes an explicit temptation: when the press is suppressed, the public does not learn
about corruption.

**Size of `poor`** (required for the socialist utopia): per semester
`Δ = 0,1 × (unemployment − 8) + Σ tam from nodes`, clamp 5–60.

### 3.6 Actor moods

```
militaryScore = support(security-forces) + Σ node.mil + temporaryModifiers
              − 8×[debt ≥ 120] − 5×recessionLevel
mediaScore    = 50 + 0.5×(approval − 50) − 0.5×max(0, corruption − 35)
              + Σ node.mid + temporaryModifiers
```

Bands (both): **≥ 55 loyal · 40–54 neutral · 25–39 critical · < 25 hostile**.

- `censorship` active: media mood never falls below **neutral** (captive media).
- `state-information-monopoly` active: media mood is always **loyal**.
- Media mood multiplies **negative event effects on support** (§4.5): loyal ×0.6, neutral ×1.0,
  critical ×1.2, hostile ×1.4.

### 3.7 Risks (probability per semester, %)

**Assassination attempt:**

```
ate = (0,8 × size(revolutionaries)
      + 1 for each non-emergent group with support < 15 and size ≥ 5
      + Σ ate from nodes + event modifiers)
      × 0,7 for each node with ate×0,7 active       // secret-police, mass-surveillance
ate = clamp(0, 25)
```

If an attempt occurs, it is **fatal** with probability `max(10, 35 − 10 × number of active nodes among
military-on-streets, secret-police, mass-surveillance)` %. Fatal = defeat. Non-fatal = the
`attack-foiled` system event (§5.2).

**Revolution** (only if `size(revolutionaries) ≥ 5`):

```
rev = (1,5 × (size(revolutionaries) − 5) + 0,3 × max(0, 35 − approval)
      + 0,5 × size(rebels) + Σ rev from nodes + event modifiers)
      × {loyal 0,5 · neutral 1,0 · critical 1,3 · hostile 1,6}   // military mood
rev = clamp(0, 40)
```

**Coup** (success):

```
coup = {loyal 0 · neutral 0 · critical 4 · hostile 12}      // military mood
    + 0,4 × max(0, 35 − approval) + 2 × recessionLevel
    + 0,5 × size(rebels) + Σ gol from nodes + event modifiers
coup = clamp(0, 50); if military is loyal, coup = min(coup, 3)
```

The semester report shows `ate` (attempt), `rev` and `gol` (success), and `rebels` = current size.

### 3.8 Emergent groups

```
Δrevolutionaries = Σ node.crev
                 + 0,5×[approval < 30] + 0,3×recessionLevel + 0,3×[unemployment > 15]
                 + eventEffects − 0,3×[approval > 55] − 0,2
revolutionaries  = clamp(0, 20)

Δrebels = { L ≤ 1: −0,5 ; L = 2: +0,5 ; L = 3: +1,0 }
       × (0,5 if military-on-streets or mass-surveillance is active, when Δ > 0)
rebels  = clamp(0, 15)
```

Support for both is always `null` (they do not affect approval). The first time `rebels > 0`, emit the
`rebels-emerge` system event.

### 3.9 Crisis flag

A crisis is active if `recessionLevel ≥ 2`, **or** an event with `crisis` occurred this semester or the
previous semester, **or** `attack-foiled` occurred this semester or the previous one. Uses: 30% discount on
Security/Power actions (S3) and the `state-of-emergency` prerequisite (S4: "crisis **or approval ≥ 60**").

---

## 4. Event system

### 4.1 Events per semester

Draw using the RNG: **1 event (35%) · 2 events (45%) · 3 events (20%)**, average 1.85. **Never zero.**
The node historical-figure reveal (current `GameEvent`) is separate and does not count. At most **one
`marcante` event with an image** appears per semester (if several qualify, the highest-weight event
gets the image; the others are text only).

### 4.2 Weight

Each event has a list of **triggers** `{ conditions[], weight }`. Effective weight:

```
weight = max(weight of triggers whose conditions (AND) are all true)   // 0 if none
     × scale             // optional: min(3, 1 + |value − threshold| / range) for indicator triggers
     × multipliers       // optional, listed in catalog (e.g. ×1.5 if pressFreedom > 40)
     × recency           // (1 + 0.5 × depth) if any trigger node was activated this semester
     × anti-monotony     // ×1.5 for positive events if none appeared in the last 2 semesters
```

Possible conditions (`Condition` type in `game-content`): active node; `taxRate` ≥/≤; indicator >/<;
approval >/<; group support <; military mood ∈ {...}; recession level ≥; `always`.

### 4.3 Draws, cooldown, and repetition

- Weighted draw **without replacement** using the game RNG (deterministic by seed).
- An event is ineligible if it occurred within the last `cooldown` turns (default 6). `unique` = once per
  game.
- Never draw the same event twice in a semester.
- If fewer events are eligible than the requested count, draw as many as are available (minimum 1). If
  none are eligible (practically impossible: 8 events have an "always" trigger), ignore cooldowns for
  events with an "always" trigger.

### 4.4 Player choices (decision: YES in MVP)

- **12 of 45 events** offer a choice with **exactly 2 options** (A and B). The rest are news only.
- The event’s **base** effect applies when drawn (at semester end). The choice is resolved at the
  **start of the next turn**, before actions: it costs no action or capital (unless the option has a
  `capital` cost; the option is disabled if the player cannot afford it).
- If the player ends the turn without choosing, **option A** is applied by default.
- Engine: `state.pendingChoices: { eventId, turn }[]` + pure function
  `resolveEventChoice(state, eventId, option)`. Risks modified by a choice apply to the current
  semester roll.

### 4.5 How events affect the game

`EventEffects` schema (shared by base effects and options):

| Field | Effect |
|---|---|
| `indicators` | **Shock to the base** (decays through reversion and has momentum). `debt` adds directly to the stock. |
| `groups` | Per-group support delta (negative values are multiplied by media mood, §3.6) |
| `all` | Support delta for all non-emergent groups (same rule) |
| `sizes` | Group-size delta, population percentage points (includes `revolutionaries`, `rebels`) |
| `media`, `military` | Temporary score modifier; **decays by 50% per semester** |
| `risks` | Percentage points added to risk **for the current semester** (one roll only) |
| `capital` | Adds/subtracts political capital |
| `crisis` | Enables the crisis flag (§3.9) |

### 4.6 Text (i18n)

- `event.<id>.title`: headline, up to ~70 characters, restrained newspaper tone.
- `event.<id>.body`: 1–2 sentences.
- `event.<id>.option.a` / `event.<id>.option.b`: button label, up to ~40 characters.
- Available interpolation: `{{country}}`, `{{president}}`.
- `marcante` events use the image `assets/events/<id>` (restrained; S6).
- Event headlines appear on the end-of-semester event screens; only marked events request their
  registered image from the API.
- The UI shows numeric consequences (deltas) calculated by the engine, not fixed descriptive text.

New type in `shared-types`: `CountryEvent { id; turn; option?: "a" | "b"; pending: boolean }`;
`SemesterReport` gains `events: CountryEvent[]`.

---

## 5. Event catalog (45)

Legend: triggers use the form "node (weight)"; alternatives are separated by `;` (the highest weight
applies). `cd` = cooldown in turns. Effect abbreviations are defined in §2; groups are identified by ID;
`all` applies to all groups; `mid`/`mil` are temporary modifiers; `rev`/`reb` are revolutionary/rebel
group sizes; `gol`/`ate`/`rv` are semester risks; `cap` = capital. (+) positive · (−) negative · (=) mixed.
★ = `marcante` (image). ⚑ = crisis.

### Security (9)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice A / B |
|---|---|---|---|---|---|---|
| 1 | `buyback-record` | + | gun-buyback (4) | 8 | Crime −2; progressives +3, middle-class +2, gun-owners −3; mid +5 | — |
| 2 | `school-shooting` ★ | − | free-carry (5); legal-militias (7) | 6 | Crime +2; all −1, progressives −5, middle-class −3; mid −10 | **A** "Decretar luto e defender o porte": gun-owners +4, agribusiness +2, progressives −4. **B** "Anunciar regras de armazenamento": cap −10, Crime −1, gun-owners −6, progressives +3, middle-class +2 |
| 3 | `militia-takes-district` | − | legal-militias (6) | 6 | Crime +4, Corruption +2; poor −5, middle-class −3; mil −10 | — |
| 4 | `military-abuse-viral` | − | military-on-streets (5); ×1,5 if pressFreedom > 40 | 6 | youth −5, progressives −5, poor −3; mid −10 | **A** "Defender as tropas": security-forces +6, mil +10, youth −3, progressives −3. **B** "Afastar o comandante": security-forces −6, mil −10, mid +10, progressives +3 |
| 5 | `wrongful-execution` ★ | − | death-penalty (4) | 10 | all −1, progressives −6, religious −4; mid −15; rev +0,5 | — |
| 6 | `journalist-disappears` | − | opposition-surveillance (5); arrest-opponents (7) | 6 | Press freedom −2; progressives −5, youth −3; mid −15; rev +0,5 | — |
| 7 | `organized-crime-wave` | − | Crime > 55 (3); scale Crime, range 15 | 4 | Crime +3, GDP −0,2; middle-class −4, business −2 | — |
| 8 | `coup-rumors` | − | military mood critical or hostile (5) | 4 | gol +3 | **A** "Expurgar oficiais suspeitos": gol −6, security-forces −8, Press freedom −1. **B** "Reajustar os soldos": Debt +1,5, mil +15, security-forces +5 |
| 9 | `police-strike` | − | support(security-forces) < 35 (4); Debt > 120 (4) | 6 | Crime +3; middle-class −3 | **A** "Conceder reajuste": Debt +1, security-forces +8, mil +5. **B** "Descontar os dias parados": Crime +2, security-forces −6, mil −5 |

### Economy (9)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 10 | `shortages` | − | price-controls (6) | 4 | Inflation +1,0, GDP −0,3; poor −4, middle-class −4, retirees −2 | — |
| 11 | `capital-flight` | − | taxRate ≥ 60 (4); sector-nationalization (5); end-private-property (7) | 6 | GDP −0,6, Unemployment +0,4, Debt +2; business −5, rich −6; size rich −0,3 | — |
| 12 | `investment-boom` | + | taxRate ≤ 20 (3); privatizations (4); deregulation (4); ×0,5 if corruption > 55 | 6 | GDP +0,6, Unemployment −0,4; business +5, rich +3, youth +2 | — |
| 13 | `credit-downgrade` | − | Debt > 90 (4); scale Debt, range 40 | 6 | Debt +2, GDP −0,3, Inflation +0,5; business −4, middle-class −2; mid −5 | — |
| 14 | `currency-crisis` ★⚑ | − | Inflation > 15 (4); Debt > 130 (4) | 8 | Inflation +4, GDP −0,6; all −2, retirees −4, middle-class −3 | — |
| 15 | `commodity-boom` | + | always (1); any node of exploitation (2) | 8 | GDP +0,8, Unemployment −0,3, Debt −2; agribusiness +5 | — |
| 16 | `commodity-crash` | − | always (1); any node of exploitation (2) | 8 | GDP −0,8, Unemployment +0,3, Debt +2; agribusiness −5, workers −2 | — |
| 17 | `global-recession` ⚑ | − | always (0,8) | 12 | GDP −1,0, Unemployment +0,6; all −1 | — |
| 18 | `good-harvest` | + | always (2) | 4 | Inflation −0,8, GDP +0,2; agribusiness +4, poor +2 | — |

### Labor (2)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 19 | `general-strike` ★ | − | labor-reform (4); Inflation > 12 (4); end-minimum-wage (5); strike-ban (5) | 6 | GDP −0,5; business −3, middle-class −2 | **A** "Negociar com as centrais": cap −10, Inflation +0,5, workers +6, retirees +2, business −4. **B** "Dispersar os piquetes": Press freedom −2, workers −8, youth −4, security-forces +3, mil +5, rev +0,5 |
| 20 | `union-agreement` | + | minimum-wage-raise (4); ×0,5 if Inflation > 10 | 8 | Inflation +0,2, GDP +0,1; workers +5, business −1 | — |

### Health (3)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 21 | `hospital-queue-scandal` | − | private-partnerships (4); Health < 45 (4, scale Health, range 15) | 4 | Health −1; poor −5, retirees −5; mid −5 | — |
| 22 | `epidemic` ★⚑ | − | always (0,5); Health < 40 (3, scale Health, range 15) | 10 | Health −5, GDP −0,5; all −1 | **A** "Decretar quarentena": GDP −0,6, Health +3, business −5, youth −3, retirees +3. **B** "Manter tudo aberto": Health −4, retirees −6, poor −3, business +3 |
| 23 | `medical-breakthrough` | + | public-network-expansion (3); Health > 65 (3) | 8 | Health +3; retirees +4, poor +2; mid +5 | — |

### Education (2)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 24 | `school-ranking-record` | + | free-university (4); Education > 65 (4) | 6 | Education +2; youth +4, middle-class +2; mid +5 | — |
| 25 | `student-protests` | − | Education > 60 and pressFreedom < 40 (3); state-indoctrination (5); party-youth (6) | 4 | youth −5, progressives −3 | **A** "Receber os estudantes": cap −10, youth +4. **B** "Dispersar os protestos": Press freedom −2, youth −6, security-forces +3, rev +1; mid −10 |

### Social issues (4)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 26 | `religious-march` | = | same-sex-marriage (3); legal-abortion (5); all-drugs-legalization (5) | 6 | religious −4, nationalists −2, progressives +2 | — |
| 27 | `overdose-crisis` | − | all-drugs-legalization (5) | 6 | Health −3, Crime +1; middle-class −4, religious −4, retirees −2 | — |
| 28 | `morality-police-incident` ★ | − | official-religion (2); religious-law (6) | 6 | Press freedom −2; youth −6, progressives −8, religious +3; rev +0,5; mid −10 | — |
| 29 | `casino-laundering-scandal` | − | online-betting (2); casinos-allowed (5) | 6 | Corruption +4; religious −5, middle-class −3; mid −5 | — |

### Environment (4)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 30 | `environmental-disaster` ★ | − | Pollution > 65 (3); mining-in-reserves (5); end-environmental-laws (7) | 6 | Pollution +5, Health −2, GDP −0,2; environmentalists −8, progressives −3 | **A** "Multar e punir a empresa": cap −10, Corruption −2, business −4, agribusiness −4, environmentalists +4. **B** "Minimizar o caso": Corruption +2, environmentalists −5; mid −10 |
| 31 | `energy-crisis` ⚑ | − | mandatory-degrowth (4); end-fossil-fuels (6) | 6 | Inflation +1,5, GDP −0,4; middle-class −3, business −3 | **A** "Ligar termelétricas de emergência": Pollution +4, environmentalists −6, progressives −2. **B** "Decretar racionamento": GDP −0,5, business −4, middle-class −2, environmentalists +2 |
| 32 | `climate-award` | + | Pollution < 30 (3); reserve-protection (4) | 8 | GDP +0,2; environmentalists +5, progressives +3; mid +5 | — |
| 33 | `natural-disaster` ★⚑ | − | always (1,5); Pollution > 60 (3) | 6 | GDP −0,4, Health −2, Debt +1,5; all −1, poor −3 | — |

### Immigration (2)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 34 | `migration-wave` | = | easier-visas (1,5); open-borders (5) | 6 | GDP +0,2, Unemployment +0,3; size immigrants +1; nationalists −6, immigrants +4, workers −2 | — |
| 35 | `labor-shortage` | − | immigration-quotas (2); mass-deportation (6) | 6 | GDP −0,4, Inflation +0,5; agribusiness −6, business −4 | — |

### Press and freedoms (2)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 36 | `hacker-leak` | − | internet-monitoring (4); censorship (4); ×1,5 if thought-police | 6 | Press freedom +2; all −1, youth −4, progressives −3; mid −10 | — |
| 37 | `corruption-scoop` | − | Corruption > 50 (4; scale Corruption, range 20); **never** with censorship active | 4 | middle-class −4, youth −3, progressives −3; mid −10 | **A** "Demitir o ministro": cap −10, Corruption −3, middle-class +2. **B** "Negar tudo": Corruption +1, all −1; mid −10 |

### Power and regime (6)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 38 | `judges-resign` | − | judiciary-control (5) | unique | GDP −0,2, Press freedom −2, Corruption +2; progressives −5, business −3; mid −10 | — |
| 39 | `leader-statue-toppled` ★ | − | mandatory-portraits and approval < 40 (6) | 6 | all −1, nationalists −3; rev +1; mid −5; gol +2 | — |
| 40 | `mass-rally` | + | government-propaganda and approval > 50 (4); mandatory-portraits and approval > 50 (5) | 4 | all +1, nationalists +4; mid +5 | — |
| 41 | `palace-intrigue` | − | succession (2); coronation (4) | 6 | Corruption +1; mil −10; gol +3 | — |
| 42 | `international-sanctions` ★ | − | arrest-opponents (2); mass-deportation (4); torture (5); end-of-elections (5); opponent-assassination (6) | 8 | GDP −0,6, Inflation +0,5, Debt +1; business −4, rich −3, nationalists +3 | **A** "Desafiar as potências": GDP −0,3, nationalists +4, progressives −3. **B** "Libertar presos políticos": GDP +0,4, rev +1, nationalists −3, security-forces −4; mid +5 |
| 43 | `mass-protests` ★ | − | approval < 30 (4); rule-by-decree and approval < 45 (4); ×1,5 if state-of-emergency | 4 | Crime +2; all −1; rev +1 | **A** "Fazer concessões": cap −15, all +2. **B** "Reprimir as manifestações": Press freedom −3, security-forces +4, rev +1,5, mil +5; mid −10 |

### Country state, independent of policy (2)

| # | id | Tone | Triggers (weight) / multipliers | Cooldown | Base effects | Choice |
|---|---|---|---|---|---|---|
| 44 | `sports-victory` | + | always (1,5) | 10 | all +2, nationalists +2 | — |
| 45 | `infrastructure-collapse` | − | always (0,8); Debt > 100 (2,5); minimal-state (3) | 6 | Health −1, GDP −0,2, Corruption +1; all −2; mid −5 | — |

Summary: 10 positive, 2 mixed, 33 negative; 12 offer a choice (2, 4, 8, 9, 19, 22, 25, 30, 31, 37,
42, 43); 8 have an "always" trigger (15, 16, 17, 18, 22, 33, 44, 45); all 25 trees trigger at least
one event (taxes via events 11/12).

### 5.2 System events (generated by the engine, not drawn)

They use the same i18n format (`event.<id>.title/.body`) and do not count toward the semester quota:

| id | When | Effect |
|---|---|---|
| `attack-foiled` ★⚑ | non-fatal assassination attempt | all +3 (public sympathy); mid +10; crisis for 2 semesters |
| `attack-fatal` ★ | fatal attempt | defeat |
| `coup` ★ | coup roll | defeat |
| `revolution` ★ | revolution roll | defeat |
| `rebels-emerge` | first time rebels > 0 | news only |
| `recession-starts` / `recession-ends` | recession level rises from 0 / returns to 0 | news only |

---

## 6. Resolutions of open draft decisions

1. **Events with choices?** **Yes in the MVP**: 12 of 45, always 2 options, resolved at the start of
   the next turn, with option A as the default (§4.4). Choices turn randomness into a decision and are
   the simplest remedy for monotony; implementation requires a `pendingChoices` field and a pure function.
2. **Frequency:** 1/2/3 events at 35/45/20% (average 1.85), never zero, default cooldown 6 (§4.1).
3. **Design document §5, item 33 — updated wording:**
   > 33. **Events and crises:** occur **every semester** (1 to 3), driven mainly by active policies and
   > the state of the country. Even without new policies, the country changes and events occur. Some
   > events ask the player to choose between two responses.

   Other wording changes in the design document:
   - §2 item 13, add: "Raising or lowering intensity is an adjustment, not an undo: the sitting
     president can change it in either direction."
   - §3 item 19, add: "The engine applies the full impact at the end of the semester; 'more radical,
     more immediate' appears in the animation and in consequences (events) during the activation semester."
   - S4 item 1: "high approval" means **approval ≥ 60**.
4. **Taxes:** start at **30%** (inherited active taxes-20 and taxes-30). Lowering them does **not** depend on
   issue #16: the sitting president may adjust intensity in either direction (§1.4).
5. **Repression has little direct effect on GDP:** **confirmed**, but GDP is affected by compounding indirect
   channels: lower press freedom → higher corruption target (+0.5 per point below 50) → lower GDP target
   (−0.04 per point above 40); international sanctions; and legal uncertainty from authoritarian nodes
   (judiciary-control, election-postponement, end-of-elections: −0.2/−0.2/−0.3).

### 6.6 Additional findings (requiring minimal data/engine decisions)

- **Conflict between `casino-ban` and `casinos-allowed`**: they are in non-opposing trees and can coexist.
  Decision: block these two nodes mutually through the same extra-prerequisite table already used for
  monarchy (`EXTRA_PREREQS` in the mock), as an exclusive pair. No new abstraction.
- **Utopia criteria without a matching game indicator** (for issue #17), final proxies:
  - *1984*: pressFreedom ≤ 5 and revolutionaries < 1.
  - Socialist ("minimum inequality"): size(poor) ≤ 15 and unemployment ≤ 5.
  - Anarcho-capitalist: taxRate = 0, gdp ≥ 5, and crime ≤ 30.
  - Theocracy: religious is the largest group and support(religious) ≥ 70.
  - Technocracy: pollution ≤ 15, education ≥ 65, and health ≥ 65.
  - (Plus complete trees and 4 consecutive turns without a coup, revolution, or successful assassination; S5.)

---

## 7. Calibration notes (what to watch during playtesting)

Run headless simulations with fixed seeds (passive bot, "free market" bot, "welfare state" bot,
"dictator" bot) for 80 turns and track:

1. **Passive player:** after 20 years, expect debt ~95–110, corruption ~45, approval 40–48, and at least
   one mild recession. If play is too comfortable, increase the structural deficit (0.3 → 0.5) or
   government fatigue (−2 → −3 per term).
2. **Coup rate in a typical democracy** (neutral military, approval 40–50): target < 5% over 80 turns.
   If higher, lower the approval coefficient (0.4).
3. **Dictator:** target ~50% chance of removal/death over 20 semesters after completing secret police +
   media control. Most sensitive parameters: secret police `crev` (adds 1.0), 0.8 × revolutionaries in
   assassination risk, and fatality chance (35%).
4. **Free market is the likely dominant tree** (GDP +2.2 and improves debt). If it dominates, increase
   `minimal-state` health/education penalties to −8 or increase `poor` `tam`.
5. **Public health/education** may seem useless because they are expensive. If players avoid them, lower
   debt per semester by 0.1 per node or increase education/health coefficients in the GDP target (0.03/0.02).
6. **Events:** measure the share of semesters in which only "always" events appear (target < 30% for
   active players) and perceived repetition (no event more than 6 times in 80 turns).
7. **Theocracy:** growing `religious` from 28 to > 41 (`workers`) takes ~28 semesters; if this proves
   impractical, increase `religious-law` `tam` by +0.5.
8. **Starting in `crisis`:** debt rises ~3 pp/semester early on; ensure recession level 1 after ~2
   semesters does not make defeat nearly certain before the first election.
