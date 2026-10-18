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

## Metadados de arquivo (imagens de evento) no Postgres, não em `game-content`

`apps/api` guarda em Postgres (tabela `event_images`, via Drizzle ORM) só a localização física das
imagens geradas para cada evento (`event_name` → `file_location`). Isso é diferente do conteúdo de
design do item anterior: não é uma regra de jogo nem dado de balanceamento, é metadado operacional
de onde um arquivo binário está — e no futuro vai variar em runtime (mais de uma imagem por evento,
possivelmente escolha aleatória/rotativa), o que pede uma tabela consultável em vez de um módulo TS
estático. `event_name` referencia o `nodeId` de uma árvore de política (`packages/game-content`),
mas não é uma foreign key para uma tabela de "eventos" — o catálogo de conteúdo continua vivendo só
em TS tipado; o Postgres não duplica esse catálogo.

Escolhemos **Drizzle ORM** (+ driver `pg`) em vez de Prisma ou SQL cru: migrations em SQL geradas a
partir de um schema TypeScript, sem um codegen/schema-language paralelo ao TS, e com tipagem forte
sem `any` — alinhado à regra do `CLAUDE.md`.

## i18n desde o primeiro componente

O jogo é pt-BR e inglês desde a v0.4 do roteiro (não é um caso de "traduzir depois"). Introduzir
i18next desde o início evita o retrabalho de extrair strings hard-coded de toda a UI mais tarde.
"Decreto" é a única string que nunca passa por tradução, em nenhum idioma.

## Decisões em aberto

Nenhuma até o momento. Novas decisões de arquitetura devem ser adicionadas aqui conforme forem
tomadas, com a razão por trás — não só o resultado.
