# Decreto

A web-based political game. The player governs a fictional country in four-year terms, trying to
get reelected and avoid being ousted, dying, or stagnating for 40 years — without parties or scores,
with free decisions across the political spectrum.

## Current status

The web app uses the API and server-side game engine for policy previews, semesters, events, and
elections. Game content (trees, groups, regimes, utopias, historical figures) lives in
`packages/game-content`; saves live in PostgreSQL. Accounts and save ownership remain tracked in
[issue #18](https://github.com/viniciuspassos/decreto/issues/18), so this setup is for local
development rather than public deployment.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+ (via `corepack enable`, or `npm install -g pnpm`)
- [Docker](https://www.docker.com/) + Docker Compose to run the application in containers

## Development (without Docker)

```bash
pnpm install        # install dependencies for all workspace packages
cp .env.example .env  # configure the host database connection
pnpm dev:db         # start PostgreSQL and wait until it is healthy
pnpm --filter @decreto/api run db:migrate # apply migrations for a fresh database
pnpm --filter @decreto/api run db:seed    # populate initial data
pnpm dev            # start apps/web (Vite, http://localhost:5173) and apps/api (http://localhost:3001) in parallel
```

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
(PostgreSQL). A one-shot `migrate` service applies migrations and seeds the database before the API starts.

```bash
cp .env.example .env   # adjust variables if needed (for example, to resolve port conflicts)
docker compose up --build
```

Exposed services (default ports, configurable via `.env`):

- **web** — http://localhost:8080 (`/api/*` forwards to the API on the same origin)
- **api** — http://localhost:3001 (`GET /health` returns `{"status":"ok","version":"0.1.0"}`)
- **db** — `localhost:5432` (PostgreSQL)

To stop the containers and remove volumes (resetting the database):

```bash
docker compose down -v
```

Compose applies migrations and the idempotent seed automatically. For host development, run these
commands after `pnpm dev:db` when setting up a fresh database:

```bash
pnpm --filter @decreto/api run db:migrate
pnpm --filter @decreto/api run db:seed
```

The `.env` file uses `localhost` for host commands; Compose constructs an internal URL using `db`.
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
  game-engine/   # pure game engine rules
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
