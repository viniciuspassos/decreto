# Infrastructure

**Status: monorepo, Docker containers, linting, tests, git hooks, and CI are implemented.** See
[`README.md`](../README.md) for day-to-day commands.

## Monorepo

- Package manager: **pnpm** (workspaces).
- Build and test orchestrator with caching: **Turborepo**.
- Packages: `apps/web`, `apps/api`, `packages/game-engine`, `packages/game-content`,
  `packages/shared-types`, `tools/diff-coverage` (see `CLAUDE.md` → "Monorepo structure").

## Scripts

Each package exposes at least: `dev`, `build`, `typecheck`, `lint`, `test`. Running `pnpm <script>`
from the root runs it across all packages via Turborepo, with caching (`pnpm typecheck`, `pnpm lint`,
`pnpm test`, `pnpm build`). `apps/web` may add `test:e2e` (Playwright) when needed — it is not a
required gate for every PR.

## Linting and tests

- **ESLint** (`eslint.config.mjs` at the root, flat config): recommended JS/TS rules
  (`typescript-eslint`) plus React/React Hooks in `apps/web`, with the complexity limits from
  `CLAUDE.md` (`complexity` ≤ 10, `max-depth` ≤ 3, `max-params` ≤ 4, `max-lines-per-function` ≤ 80),
  disabled in `*.test.ts(x)` files. Each package runs `eslint .`, which finds the root config by
  walking up the directory tree.
- **Jest** in all packages (ESM via `ts-jest`), with `collectCoverage` enabled and
  `coverageReporters: ["json", "text-summary"]`. Each package's `coverage/coverage-final.json`
  feeds the diff-aware coverage gate (see below). `apps/web` uses `jest-environment-jsdom`,
  `@testing-library/react`, and `@testing-library/jest-dom`.

## Docker containers

- `apps/api/Dockerfile` and `apps/web/Dockerfile` use multi-stage builds (install workspace
  dependencies filtered by package, build, and copy only what the final image needs). `apps/web`
  serves the static build via Nginx; `apps/api` runs the compiled `dist/` directly with Node.
- The root `docker-compose.yml` starts `db` (Postgres), then a one-shot `migrate` job that also seeds data,
  then healthy `api` and `web` services. The API image runs as `node`; the web image uses
  unprivileged Nginx on container port 8080. Nginx forwards `/api/` to the API and removes the
  prefix. Vite uses the same proxy for local development. See the README for commands.
- `pnpm dev:db` starts just PostgreSQL and waits for its healthcheck. Copy `.env.example` to `.env`
  for host development: its `DATABASE_URL` uses `localhost`; Compose builds a separate internal URL
  from `POSTGRES_*` using host `db`. `pnpm dev`, `db:migrate`, and `db:seed` read the root `.env`.

## Diff-aware coverage gate (`tools/diff-coverage`)

This package (`@decreto/diff-coverage`, tested like any other package) determines whether `pre-push`
and CI pass:

1. Reads `git diff --merge-base <base> -U0` between `HEAD` and the base (default `origin/main`) and
   extracts added line numbers per file (`src/parseDiff.ts`).
2. Filters to source files (`apps|packages|tools/*/src/**/*.ts(x)`, excluding `*.test.ts(x)`)
   (`src/gatedFiles.ts`).
3. Merges all packages' `coverage/coverage-final.json` files using `istanbul-lib-coverage`
   (`src/mergeCoverage.ts`).
4. For each changed line, the gate fails and reports `file:line` if no test executed the file or if
   the line belongs to an Istanbul `statement` with a zero count. Lines without a `statement`
   (comments, blank lines, type declarations) are not checked (`src/findUncovered.ts`).

**Exception:** a missing `index.ts`/`types.ts` in coverage (a barrel containing only
`export ... from`, or a types-only module) is not flagged. Such files compile to zero statements, so
they never appear in `coverage-final.json`, even when tested. If the same file appears in coverage
(because it contains real logic) and a line has a zero count, it is checked as usual. The exception
applies only to missing files, never to a filename alone (`src/findUncovered.ts`,
`flagMissingFile`/`UNINSTRUMENTABLE_BASENAME`).

Run with `pnpm diff-coverage [baseRef]` (default `origin/main`).

## Git hooks

Hooks are installed automatically by pnpm's `prepare` script (`husky`); `pnpm install` activates
them without a manual step. Scripts in `.husky/`:

- **`pre-commit`:** `pnpm turbo run typecheck lint test` (complexity is an ESLint rule covered by
  `lint`).
- **`commit-msg`:** `pnpm commitlint --edit` (Conventional Commits, `commitlint.config.js`).
- **`pre-push`:** `pnpm turbo run typecheck lint test build` + `pnpm diff-coverage origin/main`.

`core.hooksPath` is a Git repository setting (`.git/config`), so it applies to the main checkout and
to all worktrees sharing the same `.git`.

## CI (`.github/workflows/ci.yml`)

- Runs on `push`/`pull_request` to `main`.
- `actions/checkout` with `fetch-depth: 0` + `git fetch origin main`, so the diff-aware coverage gate
  can calculate the merge base.
- `pnpm install --frozen-lockfile` → `pnpm turbo run typecheck lint test build` →
  `pnpm diff-coverage origin/main` (the same gate as `pre-push`, now required for merge).
- Turborepo cache via `actions/cache` (keyed by `github.sha`, with fallback by `runner.os`).
- The `ci` job still starts `services.postgres` (`postgres:16-alpine`, same credentials as
  `.env.example`) and runs an "Apply DB migrations" step (`pnpm --filter @decreto/api run db:migrate`),
  but tests no longer require this — see "Postgres (`apps/api`)" below. Removing these from the
  workflow is tracked in [issue #42](https://github.com/viniciuspassos/decreto/issues/42).
- A separate, initially non-blocking `e2e` job starts the full application with
  `NODE_ENV=test docker compose up -d --build --wait`, installs Chromium, and runs
  `pnpm --filter @decreto/web test:e2e`. It saves Playwright traces and screenshots on failure.
  Locally, start Compose with `NODE_ENV=test` first, then run the same `test:e2e` command. The browser uses
  `http://localhost:8080` by default; set `E2E_BASE_URL` to target another Compose port.

## Postgres (`apps/api`)

- ORM: **Drizzle** (`drizzle-orm` + `pg` driver). Typed schema at `apps/api/src/db/schema.ts`;
  generated SQL migrations in `apps/api/drizzle/` (never write them by hand), using
  `pnpm --filter @decreto/api run db:generate` whenever the schema changes.
- Package scripts: `db:generate` (generate a migration from the schema), `db:migrate` (apply pending
  migrations with the compiled Drizzle migrator; reads `DATABASE_URL`), `db:seed` (idempotently populate initial data, e.g.
  `event_images` by scanning each event subdirectory under `ASSETS_DIR` for PNG, JPEG, and WebP files).
- Compose mounts `./assets/images` read-only into both the migration job and API container. For host
  development, `ASSETS_DIR` defaults to the repository's `assets/images`; rerun `db:seed` after adding
  images so their relative paths are registered in Postgres.
- **Tests:** `apps/api` tests that touch `src/db/**` (and routes that depend on the database) run
  against **PGlite** (`@electric-sql/pglite`) via `apps/api/src/db/testDb.ts`. This is the Postgres
  engine compiled to WASM, applying the real migrations in an isolated, disposable database per
  test file (one instance per `beforeAll`, reused by that file's `it`s), with no query-layer mock or
  external server. `DATABASE_URL` and `docker compose up -d db` are not required for `pnpm test` or
  the `pre-commit`/`pre-push` hooks. `DATABASE_URL` is read only by `createDb()` (real production/dev
  use) and the `db:migrate`/`db:seed`/`db:generate` scripts.

## Deployment (undecided)

Hosting for `apps/web` and `apps/api`, and provisioning for production PostgreSQL, have not been
discussed. Update this section when those decisions are made.
