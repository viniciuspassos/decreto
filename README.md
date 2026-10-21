# Decreto

A web-based political game. The player governs a fictional country in four-year terms, trying to
get reelected and avoid being ousted, dying, or stagnating for 40 years — without parties or scores,
with free decisions across the political spectrum.

## Current status

The frontend v0 (`apps/web`) includes all design screens and is playable end to end with a **mocked**
backend in `apps/web/src/api/mockApi.ts`. Game content (trees, groups, regimes, utopias, historical
figures) already lives in `packages/game-content`; the real engine (`apps/api` + `packages/game-engine`)
has not been implemented yet — the API only responds to `/health`.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+ (via `corepack enable`, or `npm install -g pnpm`)
- [Docker](https://www.docker.com/) + Docker Compose to run the application in containers

## Development (without Docker)

```bash
pnpm install        # install dependencies for all workspace packages
pnpm dev            # start apps/web (Vite, http://localhost:5173) and apps/api (http://localhost:3001) in parallel
```

### Frontend only, with mocked data

```bash
pnpm install
pnpm dev:mocked     # build shared packages and start only apps/web at http://localhost:5173
```

No API, database, or Docker is needed: all game rules come from `apps/web/src/api/mockApi.ts`.
To get started quickly, select "Continuar partida" on the home screen (sample save).

Other useful root commands (run across all packages via Turborepo, with caching):

```bash
pnpm build          # production build for all packages/apps
pnpm typecheck      # tsc --noEmit across all packages
pnpm test           # Jest (with coverage) across all packages
pnpm lint           # ESLint across all packages
pnpm diff-coverage  # diff-aware coverage gate against origin/main (also run by pre-push)
```

Each package (`apps/web`, `apps/api`, `packages/*`, `tools/diff-coverage`) also exposes these
scripts individually; see each `package.json`. Git hooks (`pre-commit`, `commit-msg`, `pre-push`)
and the CI pipeline are configured — see [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md).

## Docker

The application runs in containers: `web` (static build served by Nginx), `api` (Node), and `db`
(PostgreSQL).

```bash
cp .env.example .env   # adjust variables if needed (for example, to resolve port conflicts)
docker compose up --build
```

Exposed services (default ports, configurable via `.env`):

- **web** — http://localhost:8080
- **api** — http://localhost:3001 (`GET /health` returns `{"status":"ok","version":"0.1.0"}`)
- **db** — `localhost:5432` (PostgreSQL)

To stop the containers and remove volumes (resetting the database):

```bash
docker compose down -v
```

The `api` does not apply migrations automatically at startup. Once `db` is running locally or via
Docker, run these commands once:

```bash
pnpm --filter @decreto/api run db:migrate
pnpm --filter @decreto/api run db:seed
```

`pnpm test` and the git hooks do not require Postgres or `DATABASE_URL`: `apps/api` tests use a
PGlite database (Postgres in WASM), isolated per test file — see
[`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md#postgres-appsapi). `DATABASE_URL` is only
required to run the actual API (`pnpm dev`, Docker) or the `db:migrate`/`db:seed` scripts.

## Documentation

- [`game-design.md`](./game-design.md) — source of truth for **game design**: rules, turns,
  political capital, policy trees, voter groups, regimes, utopias, repression, and end-game conditions.
- [`CLAUDE.md`](./CLAUDE.md) — operational guide for AI-assisted development: mechanics summary,
  chosen stack, code conventions, and tests.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — rationale behind architecture decisions.
- [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md) — CI, git hooks, linting/testing, and the
  diff-aware coverage gate.
- [`docs/game-design/movement-effects-events.md`](./docs/game-design/movement-effects-events.md) —
  detailed technical specification of game effects, simulation movement, and events.

## Monorepo structure

```
apps/
  web/      # React + Vite + TypeScript frontend, i18next (pt-BR/en)
  api/      # Node + TypeScript (Express) backend; game engine runs here
packages/
  game-content/  # typed data: trees, groups, regimes, utopias, historical figures
  game-engine/   # pure game engine rules (currently a testable placeholder)
  shared-types/  # types shared between api and web
tools/
  diff-coverage/ # diff-aware coverage gate used by pre-push and CI
```

## Stack

- Monorepo: pnpm workspaces + Turborepo.
- Frontend: React + TypeScript + Vite, i18next/react-i18next (pt-BR/en). "Decreto" is never
  translated.
- Backend: Node.js + TypeScript + Express — the authoritative game engine runs on the server.
- Database: PostgreSQL (user accounts and game saves).
- Tests: Jest (unit/integration); Playwright (frontend E2E, when needed — not configured yet).
- Containers: Docker + Docker Compose (`web`, `api`, `db`).

See `CLAUDE.md` for code conventions and details behind each decision.
