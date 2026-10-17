# Arquitetura — o porquê

Este documento registra as decisões de arquitetura e a razão de cada uma. Para *o quê* (regras do
jogo), ver [`roteiro-do-jogo.md`](../roteiro-do-jogo.md). Para convenções de código no dia a dia,
ver [`CLAUDE.md`](../CLAUDE.md).

## Motor de jogo roda no backend, não no cliente

O motor (cálculo de turnos, custo de capital político, cascata de pré-requisitos/desfazer entre
nós de árvore, condições de fim de jogo e de utopia) é a lógica de negócio mais sensível do
projeto — fórmulas erradas ali quebram o balanceamento do jogo inteiro. Decidimos deixá-lo
autoritativo no backend (Node.js + TypeScript) em vez de duplicá-lo ou confiar nele apenas no
cliente, por dois motivos:

1. **Integridade:** um cliente web é manipulável (DevTools, requests forjados). Se o cálculo de
   capital/efeitos rodasse só no frontend, seria trivial para o jogador trapacear.
2. **Fonte única:** com o motor em um lugar só, não há risco de frontend e backend divergirem na
   interpretação de uma regra (ex.: fórmula de custo em S3 do roteiro).

Consequência prática: o frontend nunca reimplementa regras de jogo — ele só exibe o estado que o
backend retorna e envia intenções do jogador (ex.: "ativar nó X") para validação no servidor.

## Conteúdo de jogo como dados tipados, não hard-coded

Árvores de políticas, grupos de eleitores, pesos de custo, etapas de regime, requisitos de utopia
e a tabela de figuras históricas (S1–S7 do roteiro) mudam com frequência durante o balanceamento do
jogo — é conteúdo de design, não lógica de engenharia. Por isso vivem em módulos de dados tipados
(`packages/game-content`), separados do motor (`packages/game-engine`) e da UI. Isso permite:

- Ajustar/adicionar conteúdo sem tocar em código de regras.
- Checagem de tipos em build (preferido sobre JSON solto, que exigiria validação de schema em
  runtime para a mesma garantia).

## Monorepo (pnpm workspaces + Turborepo)

Frontend, backend e os pacotes compartilhados (`game-engine`, `game-content`, `shared-types`)
evoluem juntos e compartilham tipos (ex.: o formato de um nó de árvore é o mesmo dos dois lados).
Um monorepo com cache de build/test (Turborepo) evita duplicar esses tipos em repositórios
separados e mantém o custo de CI baixo conforme o projeto cresce. `apps/web` e `apps/api` são
pacotes independentes dentro dele — nenhuma mudança num deveria forçar rebuild/retest do outro, a
não ser que um pacote compartilhado tenha mudado.

## i18n desde o primeiro componente

O jogo é pt-BR e inglês desde a v0.4 do roteiro (não é um caso de "traduzir depois"). Introduzir
i18next desde o início evita o retrabalho de extrair strings hard-coded de toda a UI mais tarde.
"Decreto" é a única string que nunca passa por tradução, em nenhum idioma.

## Decisões em aberto

Nenhuma até o momento. Novas decisões de arquitetura devem ser adicionadas aqui conforme forem
tomadas, com a razão por trás — não só o resultado.
