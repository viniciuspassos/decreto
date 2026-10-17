# Decreto — Guia do Projeto

Jogo de política web. O jogador é presidente de um país fictício e
governa por mandatos de 4 anos, tentando ser reeleito e evitar queda, morte ou estagnação por 40
anos.

**Fonte da verdade do design é `roteiro-do-jogo.md`** (raiz do repo). Este arquivo não duplica o
roteiro — resume o que todo código precisa respeitar e aponta de volta para as seções relevantes.
Qualquer dúvida sobre regra de negócio deve ser resolvida lendo o roteiro primeiro; segundo ele, não
há dúvidas de negócio em aberto nesta versão (0.4).

## Resumo das mecânicas (ver roteiro para detalhes)

- **Turnos:** mandato de 4 anos = 8 turnos semestrais. 0–6 ações por turno, limitadas pelo capital
  político disponível. Ajustar a intensidade de uma política conta como uma ação.
- **Árvores de políticas:** cada árvore é unidirecional (do nó moderado ao radical). Um nó só pode
  ser ativado se o nó anterior da mesma árvore estiver ativo. Árvores opostas no mesmo campo se
  bloqueiam mutuamente quando uma está ativa (roteiro §3.16.1, S1).
- **Desfazer políticas:** o presidente em exercício nunca desfaz as próprias políticas (nem em
  reeleição seguida). Apenas um presidente diferente, ao assumir, pode desfazer políticas do
  antecessor — e isso derruba em cascata os nós dependentes. Custo de desfazer usa a fórmula
  invertida (mais radical = mais barato) (roteiro §3.17, S3).
- **Capital político:** ganho depende só da aprovação (não há Congresso/ministros/impeachment).
  Sobra acumula entre turnos. Custo de ativar um nó cresce linearmente com radicalidade
  (profundidade × peso maior + distância da situação atual × peso menor) — fórmula e pesos em S3.
  Lua de mel (margem de vitória grande) e crises alteram o custo temporariamente.
- **Efeito das políticas:** crescimento acelerado até impacto total no fim do semestre (mais
  radical = mais imediato), depois efeito contínuo enquanto ativo, modificável por outras políticas.
- **País/economia:** indicadores (PIB, desemprego, inflação, dívida, criminalidade, saúde, educação,
  poluição, liberdade de imprensa, corrupção); orçamento simples (habitantes × % imposto); dívida sem
  limite, mas gera recessão, que pode gerar rebeldes e golpe.
- **Eleitores:** grupos (lista completa em S2) com tamanho variável, memória e lealdade; um eleitor
  pode pertencer a vários grupos. Cada ação de política sobe o apoio de um grupo e desce o de outro.
- **Eleições:** a cada 8 turnos. Promessas de campanha não cumpridas geram reação negativa do grupo
  que gostou delas. Perder não é game over: o jogador acompanha o governo seguinte (controlado pela
  IA, que não desfaz as políticas do jogador) e pode concorrer de novo depois.
- **Regimes extremos:** autoritarismo e monarquia são formas de continuar no poder, não finais
  próprios (etapas em S4). Utopias (S5) exigem múltiplas árvores 100% completas + indicadores mínimos
  + 4 turnos seguidos sem golpe/revolução/atentado — devem ser extremamente difíceis de alcançar.
- **Repressão:** conteúdo permitido e proibido definido em S6 (sem violência gráfica; sem genocídio).
- **Fim de jogo:** vitória com 20 anos seguidos no poder (democracia ou regime autoritário/monarquia)
  ou instalação de utopia. Derrota por atentado fatal, 40 anos sem vencer, ou golpe/revolução. Sem
  pontuação: comparação final com figuras históricas (S7).

## Dados de conteúdo

Árvores de políticas, grupos, pesos de custo, etapas de regime, requisitos de utopia, limites de
repressão e a tabela de figuras históricas (S1–S7 do roteiro) são **dados de jogo**, não lógica.
Devem viver em arquivos de dados (JSON/TS tipado, a decidir — ver dúvidas abaixo), nunca
hard-coded dentro de componentes de UI ou de regras de motor de jogo, para que o design possa
evoluir sem tocar no motor.

## Internacionalização

O jogo é pt-BR e inglês. O nome **"Decreto" não é traduzido** em nenhum idioma. Todo texto visível ao
jogador (nomes de políticas, grupos, eventos, manchetes) deve passar por um mecanismo de i18n desde o
primeiro componente escrito — não hard-code strings em português esperando traduzir depois.

## Tom e conteúdo sensível

"Simulação séria": repressão e violência aparecem em texto/manchetes/imagens sóbrias, nunca
graficamente. Genocídio e extermínio de grupos étnicos/religiosos estão fora do escopo do jogo (S6) —
não implementar essas opções nem dar suporte a elas em dados de conteúdo.

## Stack técnico

- **Monorepo:** pnpm workspaces + Turborepo.
- **Frontend:** React + TypeScript. Interface de rede de nós, com imagens exibidas após eventos
  marcantes.
- **Backend:** Node.js + TypeScript. O motor de jogo (turnos, cálculo de indicadores, capital
  político, verificação de pré-requisitos de árvore, condições de fim de jogo) roda no servidor —
  o frontend não deve reimplementar essas regras, apenas consumir o resultado via API.
- **Banco de dados:** PostgreSQL, para contas de usuário e saves de partida.
- **i18n:** i18next / react-i18next no frontend. Toda string visível ao jogador passa por chave de
  tradução pt-BR/en desde o primeiro componente — nunca hard-code texto em português esperando
  traduzir depois. "Decreto" nunca é traduzido.
- **Dados de conteúdo:** TypeScript tipado (não JSON solto). Árvores de políticas, grupos, pesos de
  custo, etapas de regime, requisitos de utopia e tabela de figuras históricas (S1–S7 do roteiro)
  vivem em módulos de dados tipados, separados da lógica do motor e dos componentes de UI, para que
  adicionar/ajustar conteúdo não exija tocar em regras de jogo.

### Estrutura de monorepo (sugerida — ajustar ao crescer)

```
apps/
  web/      # frontend React
  api/      # backend Node (motor de jogo, API, persistência)
packages/
  game-content/  # dados tipados: árvores, grupos, regimes, utopias, figuras históricas
  game-engine/   # regras puras (turnos, custo de capital, efeitos, condições de fim de jogo)
  shared-types/  # tipos compartilhados entre api e web (se não couberem em game-content/engine)
```

`game-engine` deve ser testável de forma isolada (funções puras sempre que possível), já que é
onde vive a lógica de negócio mais sensível do jogo (fórmulas de custo, cascata de desfazer,
condições de utopia/fim de jogo).

### Testes

- **Jest** para testes unitários/integração (TS, `game-engine`, `game-content`, `api`, componentes
  React via `@testing-library/react`).
- **Playwright** para testes end-to-end no frontend, usado quando necessário (fluxos críticos de
  UI — ex.: ativar política no grafo de nós, virar turno, fluxo de eleição), não para cobrir toda
  interação.
- TDD conforme regra global: toda função nova do motor de jogo ganha teste unitário Jest no mesmo
  commit.
- `apps/web` e `apps/api` são pacotes independentes (scripts `dev`/`build`/`typecheck`/`lint`/`test`
  próprios): nenhuma mudança no frontend deve exigir rodar/buildar o backend, e vice-versa, a não
  ser que o pacote compartilhado (`game-engine`/`game-content`) tenha mudado de fato.

## Qualidade de código

- **Sem `any` em código novo.** Preferir `unknown` + narrowing, ou tipos explícitos em
  `shared-types`/`game-content`. Isso é mais crítico ainda em `game-engine`, onde um tipo solto
  mascara erro de fórmula (custo de capital, condição de utopia) até rodar em produção.
- **Limites de complexidade no lint** (ESLint, a configurar quando o repo nascer): complexidade
  ciclomática ≤ 10, profundidade de aninhamento ≤ 3, no máx. 4 parâmetros por função, no máx. 80
  linhas por função (fora de testes). `game-engine` é o lugar onde isso mais importa: fórmulas de
  radicalidade/custo e a cascata de "desfazer" tendem a crescer em `if`s — quebrar em funções
  menores em vez de aumentar os limites.

## Git hooks e CI

- **`pre-commit`:** typecheck → lint → complexidade → testes.
- **`pre-push`:** typecheck → lint → complexidade → cobertura diff-aware contra `origin/main` (CI
  também valida isso por PR: uma função tocada no diff que nenhum teste executa deve falhar o
  gate).
- **`commit-msg`:** valida Conventional Commits.
- Hooks devem ser instalados automaticamente via script `prepare` do gerenciador de pacotes, não
  manualmente.

## Documentação

Quando o repo crescer, dividir em:
- `docs/ARCHITECTURE.md` — o *porquê* das decisões (ex.: por que motor de jogo no servidor e não no
  cliente, por que TS tipado em vez de JSON para conteúdo).
- `docs/INFRASTRUCTURE.md` — CI, hooks, pipeline de build/deploy de `apps/web` e `apps/api`.

Este `CLAUDE.md` continua sendo o resumo operacional; o roteiro continua sendo a fonte de verdade de
design.
