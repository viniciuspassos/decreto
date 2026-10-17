# Decreto

Jogo de política web inspirado em *Democracy 3*. O jogador governa um país fictício por mandatos
de 4 anos, tentando ser reeleito e evitar queda, morte ou estagnação por 40 anos — sem partidos,
sem pontuação, com decisões livres entre qualquer espectro político.

## Estado atual

Projeto ainda em fase de design/documentação. Não há código ainda — o monorepo (frontend React,
backend Node, pacotes de motor de jogo e conteúdo) ainda será criado.

## Documentação

- [`roteiro-do-jogo.md`](./roteiro-do-jogo.md) — fonte da verdade do **design** do jogo: regras,
  turnos, capital político, árvores de políticas, grupos de eleitores, regimes, utopias,
  repressão e condições de fim de jogo.
- [`CLAUDE.md`](./CLAUDE.md) — guia operacional para desenvolvimento assistido por IA: resumo das
  mecânicas, stack técnico escolhido, convenções de código e testes.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — o *porquê* das decisões de arquitetura.
- [`docs/INFRASTRUCTURE.md`](./docs/INFRASTRUCTURE.md) — CI, git hooks e pipeline de build/deploy
  (planejado; ainda não implementado).

## Stack (planejado)

- Monorepo: pnpm workspaces + Turborepo.
- Frontend: React + TypeScript, interface de rede de nós, i18n com i18next (pt-BR/en).
- Backend: Node.js + TypeScript — motor de jogo autoritativo roda no servidor.
- Banco de dados: PostgreSQL (contas de usuário e saves).
- Testes: Jest (unitário/integração) e Playwright (E2E no frontend, quando necessário).

Ver `CLAUDE.md` para detalhes e estrutura de pastas sugerida.
