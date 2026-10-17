# Infraestrutura

**Status: planejado — nada aqui está implementado ainda.** Este documento existe para registrar o
plano combinado antes do monorepo ser criado, e deve ser atualizado para refletir a realidade (com
comandos reais) no momento em que `apps/`, `packages/` e o CI forem de fato criados.

## Monorepo

- Gerenciador de pacotes: **pnpm** (workspaces).
- Orquestrador de build/test com cache: **Turborepo**.
- Pacotes: `apps/web`, `apps/api`, `packages/game-engine`, `packages/game-content`,
  `packages/shared-types` (ver `CLAUDE.md` → "Estrutura de monorepo").

## Scripts (a criar)

Cada pacote deve expor, no mínimo:

```
dev         # ambiente de desenvolvimento local
build       # build de produção
typecheck   # tsc sem emitir, apenas checagem de tipos
lint        # ESLint
test        # Jest
```

`apps/web` adiciona `test:e2e` (Playwright), usado quando necessário — não como gate obrigatório
de todo PR.

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
