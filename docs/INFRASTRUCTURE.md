# Infraestrutura

**Status: monorepo e containers Docker implementados; git hooks e CI ainda planejados (seções
abaixo).** Ver [`README.md`](../README.md) para os comandos de uso do dia a dia.

## Monorepo

- Gerenciador de pacotes: **pnpm** (workspaces).
- Orquestrador de build/test com cache: **Turborepo**.
- Pacotes: `apps/web`, `apps/api`, `packages/game-engine`, `packages/game-content`,
  `packages/shared-types` (ver `CLAUDE.md` → "Estrutura de monorepo").

## Scripts

Cada pacote expõe, no mínimo: `dev`, `build`, `typecheck`, `lint` (placeholder até o ESLint ser
configurado), `test`. Rodar da raiz com `pnpm <script>` executa em todos os pacotes via Turborepo,
com cache. `apps/web` vai adicionar `test:e2e` (Playwright) quando necessário — não como gate
obrigatório de todo PR.

## Containers Docker

- `apps/api/Dockerfile` e `apps/web/Dockerfile`: builds multi-stage (instala deps do workspace
  filtradas por pacote, builda, copia só o necessário para a imagem final). `apps/web` serve o
  build estático via Nginx; `apps/api` roda o `dist/` compilado direto com Node.
- `docker-compose.yml` na raiz sobe `db` (Postgres), `api` e `web` juntos — ver README para os
  comandos.

## Git hooks (a criar)

- **`pre-commit`:** typecheck → lint → complexidade → testes.
- **`pre-push`:** typecheck → lint → complexidade → cobertura diff-aware contra `origin/main`.
- **`commit-msg`:** valida Conventional Commits.
- Instalados automaticamente via script `prepare` do pnpm (`npm install`/`pnpm install` já deixa
  os hooks ativos, sem passo manual).

## CI (a criar)

- Roda os mesmos gates dos hooks (typecheck, lint, complexidade, testes) por pacote afetado —
  aproveitando o cache do Turborepo para não reprocessar pacotes que não mudaram.
- **Gate de cobertura diff-aware:** falha o PR se uma função tocada no diff não for exercitada por
  nenhum teste (mesmo critério do `pre-push`, mas como gate bloqueante de merge).
- `apps/api` (Node + PostgreSQL) precisa de um banco de teste disponível em CI — a decidir:
  container Postgres no próprio pipeline vs. serviço gerenciado.

## Deploy (a decidir)

Ainda não discutido: onde `apps/web` e `apps/api` serão hospedados, e como o PostgreSQL de
produção será provisionado. Atualizar esta seção quando essa decisão for tomada.
