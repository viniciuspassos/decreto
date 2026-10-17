# Decreto

Jogo de política web. O jogador governa um país fictício por mandatos
de 4 anos, tentando ser reeleito e evitar queda, morte ou estagnação por 40 anos — sem partidos,
sem pontuação, com decisões livres entre qualquer espectro político.

## Estado atual

Scaffold inicial do monorepo criado: `apps/web` (frontend), `apps/api` (backend) e os pacotes
`packages/shared-types`, `packages/game-content`, `packages/game-engine`. O conteúdo de jogo
(árvores de políticas, grupos, regimes etc.) e as regras do motor ainda não foram implementados —
por enquanto os pacotes expõem só o essencial para o monorepo buildar, testar e rodar de ponta a
ponta (frontend servido, backend respondendo `/health`, Postgres de pé).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+ (via `corepack enable`, ou `npm install -g pnpm`)
- [Docker](https://www.docker.com/) + Docker Compose, para rodar a aplicação em containers

## Rodando em desenvolvimento (sem Docker)

```bash
pnpm install        # instala as dependências de todos os pacotes do workspace
pnpm dev             # sobe apps/web (Vite, http://localhost:5173) e apps/api (http://localhost:3001) em paralelo
```

Outros comandos úteis na raiz (executam em todos os pacotes via Turborepo, com cache):

```bash
pnpm build           # build de produção de todos os pacotes/apps
pnpm typecheck        # tsc --noEmit em todos os pacotes
pnpm test             # Jest nos pacotes que têm testes
pnpm lint             # placeholder até o ESLint ser configurado
```

Cada pacote (`apps/web`, `apps/api`, `packages/*`) também expõe esses scripts individualmente —
ver `package.json` de cada um.

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

## Documentação

- [`roteiro-do-jogo.md`](./roteiro-do-jogo.md) — fonte da verdade do **design** do jogo: regras,
  turnos, capital político, árvores de políticas, grupos de eleitores, regimes, utopias,
  repressão e condições de fim de jogo.
- [`CLAUDE.md`](./CLAUDE.md) — guia operacional para desenvolvimento assistido por IA: resumo das
  mecânicas, stack técnico escolhido, convenções de código e testes.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — o *porquê* das decisões de arquitetura.
- [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md) — CI, git hooks e pipeline de build/deploy
  (parcialmente implementado; ver status no próprio arquivo).

## Estrutura do monorepo

```
apps/
  web/      # frontend React + Vite + TypeScript, i18next (pt-BR/en)
  api/      # backend Node + TypeScript (Express), motor de jogo roda aqui
packages/
  game-content/  # dados tipados: árvores, grupos, regimes, utopias, figuras históricas (ainda vazio)
  game-engine/   # regras puras do motor de jogo (ainda só um placeholder testável)
  shared-types/  # tipos compartilhados entre api e web
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
