# Architecture: why

This document records architecture decisions and the reasons behind them. For game rules, see
[`game-design.md`](../game-design.md). For day-to-day code conventions, see
[`CLAUDE.md`](../CLAUDE.md).

## The game engine runs on the backend

The engine (turn calculations, political capital costs, prerequisite and undo cascades between tree
nodes, and end-game and utopia conditions) contains the project's most sensitive business logic —
incorrect formulas would break the game's balance. It is authoritative on the backend (Node.js +
TypeScript), rather than duplicated or trusted only on the client, for two reasons:

1. **Integrity:** a web client can be manipulated (DevTools, forged requests). If capital and effects
   were calculated only on the frontend, cheating would be trivial.
2. **Single source of truth:** with the engine in one place, the frontend and backend cannot diverge
   in how they interpret a rule (for example, the cost formula in section S3 of the design document).

In practice, the frontend never reimplements game rules. It displays the state returned by the
backend and sends player intents (for example, "activate node X") for server-side validation.

## The client owns the pending queue; the server validates each turn

Selecting a policy only changes the browser's pending queue. `POST /games/:id/preview` computes
node status, total cost, remaining capital, and validation errors without saving a turn. When the
player closes the semester, `POST /games/:id/end-semester` receives that queue and validates it
again against the current game state. This keeps quick previews responsive without writing to
Postgres on every click, while ensuring that a stale or manipulated preview cannot bypass the
engine's rules. The queue is intentionally omitted from the persisted state and `GameView`.

## Saves use optimistic concurrency

Each game is one `games` row: its engine state is stored as `jsonb`, alongside a version, status,
and optional end result. A turn or election update succeeds only when `expectedVersion` matches
the stored version; the update increments it atomically. This prevents two tabs from silently
overwriting one another. The browser keeps only the game ID for continuation and reloads the
authoritative state after a conflict. The MVP has no accounts, so possession of the ID grants
access to that save; [issue #18](https://github.com/viniciuspassos/decreto/issues/18) tracks
ownership and authentication before public deployment.

## Randomness is reproducible on the server

The API generates the initial seed in production. Nonproduction requests may supply a seed for
repeatable browser tests. The engine advances and persists it with each semester, so
the same saved state and queue produce the same outcome during replay or diagnosis. `GameView`
omits the seed: the client receives the resulting events and indicators, never the random state.

## The simulation moves in layers

Active policy nodes contribute ongoing effects, while indicator trends and instability continue
to move the country between player decisions. Frequent events add shocks and choices to that
baseline. This follows the detailed movement and event rules in
[`movement-effects-events.md`](./game-design/movement-effects-events.md), which intentionally
extend the original S1–S7 outline in [`game-design.md`](../game-design.md). Keeping these layers
in the engine lets the UI render outcomes without reproducing political or economic formulas.

## Web and API share an origin

The web client calls `/api/*`. Vite forwards that path to the API during development; Nginx does
the same in Compose and removes the `/api` prefix. The browser therefore uses one origin for
both the UI and API and needs no CORS configuration. Deployment details and proxy commands are
documented in [`INFRASTRUCTURE.md`](./INFRASTRUCTURE.md).

## Game content lives in typed data

Policy trees, voter groups, cost weights, regime stages, utopia requirements, and the historical
figure table (S1–S7 in the design document) change frequently during balancing. They are design
content, not engineering logic. They therefore live in typed data modules (`packages/game-content`),
separate from the engine (`packages/game-engine`) and UI. This makes it possible to:

- Adjust or add content without changing rule code.
- Check types at build time (preferred to loose JSON, which would require runtime schema validation
  to provide the same guarantee).

## Monorepo (pnpm workspaces + Turborepo)

The frontend, backend, and shared packages (`game-engine`, `game-content`, `shared-types`) evolve
together and share types (for example, both sides use the same policy tree node format). A monorepo
with build and test caching (Turborepo) avoids duplicating these types across repositories and keeps
CI costs low as the project grows. `apps/web` and `apps/api` are independent packages: a change to
one should not force a rebuild or retest of the other unless a shared package changed.

## Event image metadata lives in Postgres

`apps/api` stores only the physical locations of generated event images in Postgres (the
`event_images` table, via Drizzle ORM; `event_name` → `file_location`). Unlike the design content
described above, this is operational metadata about where a binary file is stored, not a game rule
or balancing data. An `event_name` can have multiple rows (more than one image per event);
`findImageForEvent` picks one at random (`ORDER BY random()`) per call, which calls for a queryable
table instead of a static TS module. `event_name` refers both to a policy tree `nodeId`
(`packages/game-content`, for example `prisao-oposicao`) and to main-loop events that do not belong
to a tree (`posse`, `comicio`, `eleicao`, `atentado`, `morte` — see the main loop in the design
document). It is not a foreign key to an "events" table: the content catalog remains in typed TS,
and Postgres does not duplicate it.

We chose **Drizzle ORM** (with the `pg` driver) over Prisma or raw SQL: it generates SQL migrations
from a TypeScript schema without a parallel codegen/schema language, and provides strong typing
without `any`, in line with `CLAUDE.md`.

## i18n from the first component

The game supports Brazilian Portuguese and English from version 0.4 of the design document; this
is not a "translate later" case. Introducing i18next from the start avoids the later work of
extracting hard-coded UI strings. "Decreto" is the only string that is never translated.
