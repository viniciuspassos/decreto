# Decreto — Project Guide

A web-based political game. The player is president of a fictional country and governs in four-year
terms, trying to get reelected and avoid being ousted, dying, or stagnating for 40 years.

**The source of truth for design is `game-design.md`** (repository root). Policy effect numbers,
the simulation movement layer (trends, recession, risks), and the event catalog are in
`docs/game-design/movement-effects-events.md`. This file does not duplicate the design document; it
summarizes what all code must respect and points back to the relevant sections. Resolve business
rule questions by reading the design document first; it has no open business questions for version
0.4.

## Mechanics summary (see the design document for details)

- **Turns:** a four-year term has 8 six-month turns. Each turn allows 0–6 actions, limited by
  available political capital. Adjusting a policy's intensity counts as an action.
- **Policy trees:** each tree runs in one direction, from moderate to radical. A node can only be
  activated if the previous node in its tree is active. Opposing trees in the same field block one
  another when either is active (design document §3.16.1, S1).
- **Undoing policies:** the sitting president can never undo their own policies, even after
  reelection. Only a different president can undo a predecessor's policies, and dependent nodes
  then fall in a cascade. Undo costs use the inverse formula (more radical nodes cost less) (design
  document §3.17, S3).
- **Political capital:** gains depend only on approval (there is no Congress, ministers, or
  impeachment). Unspent capital carries between turns. Node activation cost grows linearly with
  radicalism (tree depth × higher weight + distance from the current situation × lower weight); see
  S3 for the formula and weights. A landslide honeymoon and crises temporarily change costs.
- **Policy effects:** effects ramp up to full impact by the end of the semester (more radical means
  more immediate), then continue while active and can be modified by other policies.
- **Country/economy:** indicators include GDP, unemployment, inflation, debt, crime, health,
  education, pollution, press freedom, and corruption. The simple budget is population × tax rate.
  Debt has no cap, but can cause recession, which can lead to rebels and a coup.
- **Voters:** groups (full list in S2) have variable size, memory, and loyalty; a voter can belong to
  multiple groups. Each policy action raises one group's support and lowers another's.
- **Elections:** every 8 turns. Unfulfilled campaign promises cause a negative reaction from the
  group that liked them. Losing is not game over: the player follows the next government (controlled
  by the AI, which does not undo the player's policies) and can run again later.
- **Extreme regimes:** authoritarianism and monarchy are ways to stay in power, not endings of their
  own (stages in S4). Utopias (S5) require several fully completed trees, minimum indicators, and 4
  consecutive turns without a coup, revolution, or assassination; they should be extremely hard to
  reach.
- **Repression:** permitted and prohibited content is defined in S6 (no graphic violence; no
  genocide).
- **End game:** win by staying in power for 20 consecutive years (democracy, authoritarian regime,
  or monarchy) or installing a utopia. Lose to a fatal assassination, 40 years without winning, a
  coup, or a revolution. There is no score: the final comparison is with historical figures (S7).

## Content data

Policy trees, groups, cost weights, regime stages, utopia requirements, repression limits, and the
historical figure table (S1–S7 in the design document) are **game data**, not logic. They should live
in data files (typed JSON/TS, to be decided — see open questions below), never hard-coded inside UI
components or game engine rules, so design can evolve without changing the engine.

## Internationalization

The game supports Brazilian Portuguese and English. The name **"Decreto" is never translated**.
All player-visible text (policy, group, and event names; headlines) must use an i18n mechanism from
the first component; do not hard-code Portuguese strings and plan to translate them later.

## Tone and sensitive content

"Serious simulation": repression and violence appear only in restrained text, headlines, and images,
never graphically. Genocide and extermination of ethnic or religious groups are out of scope (S6): do
not implement these options or support them in content data.

## Technical stack

- **Monorepo:** pnpm workspaces + Turborepo.
- **Frontend:** React + TypeScript. Node graph interface, with images shown after major events.
- **Backend:** Node.js + TypeScript. The game engine (turns, indicator calculations, political
  capital, tree prerequisites, and end-game conditions) runs on the server. The frontend consumes
  results via the API and does not reimplement these rules.
- **Database:** PostgreSQL for user accounts and game saves.
- **i18n:** i18next / react-i18next on the frontend. All player-visible strings use pt-BR/en
  translation keys from the first component; never hard-code Portuguese text to translate later.
  "Decreto" is never translated.
- **Content data:** typed TypeScript (not loose JSON). Policy trees, groups, cost weights, regime
  stages, utopia requirements, and historical figures (S1–S7 in the design document) live in typed
  data modules, separate from engine logic and UI components. Adding or adjusting content should
  not require changing game rules.

### Suggested monorepo structure (adjust as the project grows)

```
apps/
  web/      # React frontend
  api/      # Node backend (game engine, API, persistence)
packages/
  game-content/  # typed data: trees, groups, regimes, utopias, historical figures
  game-engine/   # pure rules (turns, capital cost, effects, end-game conditions)
  shared-types/  # types shared between api and web (if they do not belong in game-content/engine)
```

`game-engine` should be independently testable (pure functions wherever possible), since it holds
the game's most sensitive business logic (cost formulas, undo cascades, utopia/end-game conditions).

### Tests

- **Jest** for unit/integration tests (TS, `game-engine`, `game-content`, `api`, and React components
  via `@testing-library/react`).
- **Playwright** for frontend end-to-end tests when needed (critical UI flows, such as activating a
  policy on the node graph, advancing a turn, and elections), not to cover every interaction.
- Follow the global TDD rule: every new game engine function gets a Jest unit test in the same commit.
- `apps/web` and `apps/api` are independent packages with their own `dev`/`build`/`typecheck`/`lint`/
  `test` scripts. A frontend change should not require running/building the backend, and vice versa,
  unless the shared `game-engine`/`game-content` package actually changed.

## Code quality

- **No `any` in new code.** Prefer `unknown` with narrowing, or explicit types in `shared-types`/
  `game-content`. This matters especially in `game-engine`, where loose types can hide formula errors
  (capital cost, utopia conditions) until production.
- **Lint complexity limits** (ESLint; configure when the repository is created): cyclomatic
  complexity ≤ 10, nesting depth ≤ 3, at most 4 parameters per function, and at most 80 lines per
  function (excluding tests). These limits matter most in `game-engine`: split formulas for
  radicalism/cost and undo cascades into smaller functions rather than raising the limits.

## Minimal code

- Implement each change with the **smallest amount of new code** possible: reuse what exists and do
  not add abstractions the task does not require.
- **Remove code made obsolete by the change** in the same PR.
- If removing obsolete code would be a **large change** outside the task's scope, leave it for now,
  tell the user, and create a repository issue (`gh issue create`) for follow-up.

## Before starting

Before making any code change or preparing a plan, run `git fetch origin main` (or equivalent) to
ensure the `main` reference is up to date — especially important when multiple branches/worktrees
are active in this repository.

## Git hooks and CI

- **`pre-commit`:** typecheck → lint → complexity → tests.
- **`pre-push`:** typecheck → lint → complexity → diff-aware coverage against `origin/main` (CI also
  validates this on each PR: a changed function not executed by any test fails the gate).
- **`commit-msg`:** validates Conventional Commits.
- Hooks must be installed automatically through the package manager's `prepare` script, not manually.

### Code review before a PR

- Before opening a PR (`gh pr create`), invoke the code review agent/skill on the diff.
- Review for bugs and also **unnecessary code and overengineering** (abstractions, layers, parameters,
  or settings the task does not require).
- Resolve high- and medium-severity findings in the same PR before opening it.
- Turn low-severity findings into repository issues (`gh issue create`) and cite their links in the PR
  description.

### Auto-merge

- Right after opening the PR, enable auto-merge: `gh pr merge <number> --auto --squash --delete-branch`.
  It will merge once the required `ci` check passes (main branch protection); do not wait for CI or
  merge manually.
- If CI fails, the PR stays open: fix it on the same branch and push. Auto-merge remains enabled.

## Documentation

As the repository grows, split documentation into:
- `docs/ARCHITECTURE.md` — the *why* behind decisions (for example, why the game engine runs on the
  server rather than the client, and why typed TS is used for content instead of JSON).
- `docs/INFRASTRUCTURE.md` — CI, hooks, and build/deploy pipelines for `apps/web` and `apps/api`.

This `CLAUDE.md` remains the operational summary; the design document remains the source of truth.
