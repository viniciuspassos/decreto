# Decreto

Jogo de política web. O jogador governa um país fictício por mandatos
de 4 anos, tentando ser reeleito e evitar queda, morte ou estagnação por 40 anos — sem partidos,
sem pontuação, com decisões livres entre qualquer espectro político.

## Estado atual

v0 do frontend (`apps/web`) com todas as telas do design, jogável de ponta a ponta com o backend
**mockado** em `apps/web/src/api/mockApi.ts`. O conteúdo de jogo (árvores, grupos, regimes,
utopias, figuras históricas) já está em `packages/game-content`; o motor real (`apps/api` +
`packages/game-engine`) ainda não foi implementado — a API só responde `/health`.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+ (via `corepack enable`, ou `npm install -g pnpm`)
- [Docker](https://www.docker.com/) + Docker Compose, para rodar a aplicação em containers

## Rodando em desenvolvimento (sem Docker)

```bash
pnpm install        # instala as dependências de todos os pacotes do workspace
pnpm dev             # sobe apps/web (Vite, http://localhost:5173) e apps/api (http://localhost:3001) em paralelo
```

### Só o frontend, com dados mockados

```bash
pnpm install
pnpm dev:mocked      # builda os pacotes compartilhados e sobe só apps/web em http://localhost:5173
```

Não precisa de API, banco nem Docker: toda regra de jogo vem de `apps/web/src/api/mockApi.ts`.
Para começar rápido, use "Continuar partida" na tela inicial (save de exemplo).

Outros comandos úteis na raiz (executam em todos os pacotes via Turborepo, com cache):

```bash
pnpm build           # build de produção de todos os pacotes/apps
pnpm typecheck        # tsc --noEmit em todos os pacotes
pnpm test             # Jest (com coverage) em todos os pacotes
pnpm lint             # ESLint em todos os pacotes
pnpm diff-coverage    # gate de cobertura diff-aware contra origin/main (o que o pre-push roda)
```

Cada pacote (`apps/web`, `apps/api`, `packages/*`, `tools/diff-coverage`) também expõe esses
scripts individualmente — ver `package.json` de cada um. Git hooks (`pre-commit`, `commit-msg`,
`pre-push`) e o pipeline de CI já estão configurados — ver
[`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md).

## Rodando com Docker

A aplicação roda inteira em containers: `web` (build estático servido por Nginx), `api` (Node) e
`db` (PostgreSQL).

```bash
cp .env.example .env   # ajuste as variáveis se precisar (ex.: trocar portas em conflito)
docker compose up --build
```

Serviços expostos (portas padrão, configuráveis via `.env`):

- **web** — http://localhost:8080
- **api** — http://localhost:3001 (`GET /health` retorna `{"status":"ok","version":"0.1.0"}`)
- **db** — `localhost:5432` (PostgreSQL)

Para derrubar e remover os volumes (reseta o banco):

```bash
docker compose down -v
```

O `api` não aplica migrations automaticamente ao subir. Depois do `db` estar de pé (local ou via
Docker), rode uma vez:

```bash
pnpm --filter @decreto/api run db:migrate
pnpm --filter @decreto/api run db:seed
```

Rodar `pnpm test`/os git hooks localmente também exige um Postgres acessível em `DATABASE_URL` —
ver [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md#postgres-appsapi).

## Documentação

- [`roteiro-do-jogo.md`](./roteiro-do-jogo.md) — fonte da verdade do **design** do jogo: regras,
  turnos, capital político, árvores de políticas, grupos de eleitores, regimes, utopias,
  repressão e condições de fim de jogo.
- [`CLAUDE.md`](./CLAUDE.md) — guia operacional para desenvolvimento assistido por IA: resumo das
  mecânicas, stack técnico escolhido, convenções de código e testes.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — o *porquê* das decisões de arquitetura.
- [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md) — CI, git hooks, lint/testes e gate de
  cobertura diff-aware.

## Estrutura do monorepo

```
apps/
  web/      # frontend React + Vite + TypeScript, i18next (pt-BR/en)
  api/      # backend Node + TypeScript (Express), motor de jogo roda aqui
packages/
  game-content/  # dados tipados: árvores, grupos, regimes, utopias, figuras históricas
  game-engine/   # regras puras do motor de jogo (ainda só um placeholder testável)
  shared-types/  # tipos compartilhados entre api e web
tools/
  diff-coverage/ # gate de cobertura diff-aware usado pelo pre-push e pelo CI
```

## Stack

- Monorepo: pnpm workspaces + Turborepo.
- Frontend: React + TypeScript + Vite, i18next/react-i18next (pt-BR/en). "Decreto" nunca é
  traduzido.
- Backend: Node.js + TypeScript + Express — motor de jogo autoritativo roda no servidor.
- Banco de dados: PostgreSQL (contas de usuário e saves).
- Testes: Jest (unitário/integração); Playwright (E2E no frontend, quando necessário — ainda não
  configurado).
- Containers: Docker + Docker Compose (`web`, `api`, `db`).

Ver `CLAUDE.md` para convenções de código e detalhes de cada decisão.
