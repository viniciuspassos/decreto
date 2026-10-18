# Infraestrutura

**Status: monorepo, containers Docker, lint, testes, git hooks e CI implementados.** Ver
[`README.md`](../README.md) para os comandos de uso do dia a dia.

## Monorepo

- Gerenciador de pacotes: **pnpm** (workspaces).
- Orquestrador de build/test com cache: **Turborepo**.
- Pacotes: `apps/web`, `apps/api`, `packages/game-engine`, `packages/game-content`,
  `packages/shared-types`, `tools/diff-coverage` (ver `CLAUDE.md` → "Estrutura de monorepo").

## Scripts

Cada pacote expõe, no mínimo: `dev`, `build`, `typecheck`, `lint`, `test`. Rodar da raiz com
`pnpm <script>` executa em todos os pacotes via Turborepo, com cache (`pnpm typecheck`,
`pnpm lint`, `pnpm test`, `pnpm build`). `apps/web` vai adicionar `test:e2e` (Playwright) quando
necessário — não como gate obrigatório de todo PR.

## Lint e testes

- **ESLint** (`eslint.config.mjs` na raiz, flat config): regras recomendadas de JS/TS
  (`typescript-eslint`) + React/React Hooks em `apps/web`, com os limites de complexidade do
  `CLAUDE.md` (`complexity` ≤ 10, `max-depth` ≤ 3, `max-params` ≤ 4, `max-lines-per-function` ≤ 80),
  desativados em arquivos `*.test.ts(x)`. Cada pacote chama `eslint .`, que resolve o config da
  raiz subindo diretórios.
- **Jest** em todos os pacotes (ESM via `ts-jest`), com `collectCoverage` ligado e
  `coverageReporters: ["json", "text-summary"]` — o `coverage/coverage-final.json` de cada pacote
  alimenta o gate de cobertura diff-aware (ver abaixo). `apps/web` usa `jest-environment-jsdom` +
  `@testing-library/react` + `@testing-library/jest-dom`.

## Containers Docker

- `apps/api/Dockerfile` e `apps/web/Dockerfile`: builds multi-stage (instala deps do workspace
  filtradas por pacote, builda, copia só o necessário para a imagem final). `apps/web` serve o
  build estático via Nginx; `apps/api` roda o `dist/` compilado direto com Node.
- `docker-compose.yml` na raiz sobe `db` (Postgres), `api` e `web` juntos — ver README para os
  comandos.

## Gate de cobertura diff-aware (`tools/diff-coverage`)

Pacote próprio (`@decreto/diff-coverage`, testado como qualquer outro) que decide se o `pre-push` e
o CI passam:

1. Lê o `git diff --merge-base <base> -U0` entre `HEAD` e a base (default `origin/main`) e extrai
   os números de linha adicionados por arquivo (`src/parseDiff.ts`).
2. Filtra para arquivos de código-fonte (`apps|packages|tools/*/src/**/*.ts(x)`, exceto
   `*.test.ts(x)`) — `src/gatedFiles.ts`.
3. Junta os `coverage/coverage-final.json` de todos os pacotes (`istanbul-lib-coverage`) —
   `src/mergeCoverage.ts`.
4. Para cada linha alterada: se o arquivo nunca foi executado por nenhum teste, ou se a linha cai
   num `statement` do Istanbul com contagem zero, o gate falha e lista `arquivo:linha`. Linhas sem
   `statement` (comentário, linha em branco, declaração de tipo) não são cobradas —
   `src/findUncovered.ts`.

**Exceção:** um `index.ts`/`types.ts` **ausente** do coverage (barril de só `export ... from`, ou
módulo de só tipos) não é marcado — esses arquivos compilam para zero `statement`s, então nunca
apareceriam no `coverage-final.json` mesmo com teste. Se o mesmo arquivo *aparecer* no coverage
(tem lógica real) e a linha tiver contagem zero, ele é cobrado normalmente — a exceção é só por
ausência, nunca pelo nome do arquivo sozinho (`src/findUncovered.ts`, função
`flagMissingFile`/`UNINSTRUMENTABLE_BASENAME`).

Roda via `pnpm diff-coverage [baseRef]` (default `origin/main`).

## Git hooks

Instalados automaticamente pelo script `prepare` do pnpm (`husky`); `pnpm install` já deixa os
hooks ativos, sem passo manual. Scripts em `.husky/`:

- **`pre-commit`:** `pnpm turbo run typecheck lint test` (a complexidade é uma regra do ESLint,
  coberta pelo `lint`).
- **`commit-msg`:** `pnpm commitlint --edit` (Conventional Commits, `commitlint.config.js`).
- **`pre-push`:** `pnpm turbo run typecheck lint test build` + `pnpm diff-coverage origin/main`.

`core.hooksPath` é configuração do repositório Git (`.git/config`), então vale para o checkout
principal e para todos os worktrees que compartilham o mesmo `.git`.

## CI (`.github/workflows/ci.yml`)

- Dispara em `push`/`pull_request` para `main`.
- `actions/checkout` com `fetch-depth: 0` + `git fetch origin main`, para o gate de cobertura
  diff-aware conseguir calcular o merge-base.
- `pnpm install --frozen-lockfile` → `pnpm turbo run typecheck lint test build` → 
  `pnpm diff-coverage origin/main` (mesmo gate do `pre-push`, agora bloqueante de merge).
- Cache do Turborepo via `actions/cache` (chave por `github.sha`, fallback por `runner.os`).
- O job `ci` ainda sobe um `services.postgres` (`postgres:16-alpine`, mesmas credenciais do
  `.env.example`) e roda um step "Apply DB migrations"
  (`pnpm --filter @decreto/api run db:migrate`), mas isso não é mais exigido pelos testes — ver
  "Postgres (`apps/api`)" abaixo. Removê-los do workflow é cleanup rastreado na
  [issue #42](https://github.com/viniciuspassos/decreto/issues/42).

## Postgres (`apps/api`)

- ORM: **Drizzle** (`drizzle-orm` + driver `pg`). Schema tipado em `apps/api/src/db/schema.ts`;
  migrations SQL geradas (nunca escritas à mão) em `apps/api/drizzle/` via
  `pnpm --filter @decreto/api run db:generate` sempre que o schema mudar.
- Scripts do pacote: `db:generate` (gera migration a partir do schema), `db:migrate` (aplica
  migrations pendentes, lê `DATABASE_URL`), `db:seed` (popula dados iniciais de forma idempotente,
  ex. `event_images`).
- **Testes**: os testes do `apps/api` que tocam `src/db/**` (e as rotas que dependem do banco)
  rodam contra **PGlite** (`@electric-sql/pglite`) via `apps/api/src/db/testDb.ts` — o mesmo motor
  Postgres compilado para WASM, aplicando as migrations reais em um banco isolado e descartável
  por arquivo de teste (uma instância por `beforeAll`, reaproveitada pelos `it`s do mesmo
  arquivo), sem mock da camada de query nem servidor externo. Não é preciso `DATABASE_URL` nem
  `docker compose up -d db` para rodar `pnpm test`, nem para os hooks `pre-commit`/`pre-push`.
  `DATABASE_URL` só é lida por `createDb()` (produção/dev real) e pelos scripts `db:migrate`/
  `db:seed`/`db:generate`.

## Deploy (a decidir)

Ainda não discutido: onde `apps/web` e `apps/api` serão hospedados, e como o PostgreSQL de
produção será provisionado. Atualizar esta seção quando essa decisão for tomada.
