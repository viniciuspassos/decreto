# Trailers do Decreto: base comum

Três trailers de **no máximo 60 s**, horizontais (16:9), sem versão para redes sociais, gerados no
ComfyUI (Wan 2.2 T2V A14B, clipes de 2 s; ver [produção](producao.md)) e montados na edição.
Tagline comum: **"Ninguém nasce tirano. Basta um decreto."** (só no frame final)

## Roteiros

- [Trailer 1: "Mandato"](1-mandato.md)
- [Trailer 2: "Ordem e Futuro"](2-ordem-e-futuro.md)
- [Trailer 3: "Decreto"](3-decreto.md)

## Linguagem comum

- **Só imagens.** Sem diálogos, sem narração, sem cartelas de texto. O único texto em tela é a
  **interface do jogo** no monitor e o **frame final**. Quem conta a história são as imagens, a
  trilha e o som ambiente.
- **Primeira pessoa, sem rosto.** O jogador é um par de mãos numa mesa, diante de um monitor. O jogo é
  esse computador. O rosto nunca aparece (nem em retratos, estátuas ou reflexos — sempre de costas,
  contra a luz ou fora de foco), para o espectador ocupar o lugar do governante.
- **Poder crescente.** Três recursos se repetem nos três trailers, em escalada:
  1. **A câmera sobe:** cada ato começa mais longe da mesa (mesa → janela → praça → cidade → país).
  2. **O grafo acende:** a cada corte para o monitor há mais nós ativos; a barra de capital político
     enche.
  3. **Os cortes encurtam:** 2 s → 1 s → 0,5 s até o clímax, com a trilha subindo junto.
- **Interface do jogo, conteúdo livre.** O monitor é gerado com a tela apenas brilhando; na edição
  entra a interface do `apps/web` (`pnpm dev:mocked`) aplicada sobre ela. O Wan não gera texto
  legível, então telas e placas dentro das cenas (TV, telão, cartazes) não têm texto legível. Os
  nós, utopias e textos mostrados **não precisam existir no jogo**: o trailer serve à narrativa, não
  aos dados de `game-content`.
- **Um gesto simples por clipe.** Cada plano é uma única ação contínua (sem transição animada
  dentro do clipe — preenchimentos, texto surgindo, formas se transformando — e sem movimento de
  câmera composto). O Wan 2.2 anima bem um gesto só; qualquer transição complexa deve ser
  resolvida na edição, com um corte entre dois keyframes.
- **Sem violência gráfica (roteiro §S6).** Repressão e morte aparecem por som fora de quadro,
  sombras, objetos e reação das pessoas — nunca sangue, ferimento ou corpo.
- **Mesmo começo, mesmo fim.** A abertura (A1–A3) e o encerramento (E1) são idênticos nos três
  trailers: o primeiro e o último frame são os mesmos. São gerados uma vez só.
- **Orçamento de tempo.** Abertura 10 s + miolo 45 s + encerramento 5 s = **60 s**. Os tempos do
  miolo de cada trailer somam exatamente 45 s.

A coluna **Interface** só descreve o que aparece na tela do jogo, no monitor. "—" = sem monitor no
plano.

### Abertura compartilhada (0–10 s)

| # | Tempo | Plano (IA) | Interface |
|---|---|---|---|
| A1 | 2 s | Preto. Som de caneta assinando papel. | — |
| A2 | 4 s | 1ª pessoa: mãos pousam numa mesa de madeira vazia, gabinete escuro, chuva na janela. Um monitor antigo acende e ilumina as mãos. | Tela inicial do jogo: **DECRETO** |
| A3 | 4 s | Close no monitor; o cursor para sobre o primeiro nó. | Grafo de nós todo cinza |

### Encerramento compartilhado (55–60 s)

| # | Tempo | Plano | Tela |
|---|---|---|---|
| E1 | 5 s | Preto. Som de caneta assinando papel (eco de A1). | **Frame final**, igual nos três: *"Ninguém nasce tirano. Basta um decreto."* + **DECRETO** |

## Produção

Método, modelos, regras de prompt, script de geração e acompanhamento: **[producao.md](producao.md)**.

**Ao criar ou alterar um roteiro,** siga a
[estrutura de roteiro e manifest](producao.md#roteiro-e-manifest-de-cada-trailer):
- cada trailer tem um `.md` (narrativa) e um `.manifest.json` (planos em ordem, com os prompts);
- a abertura e o encerramento ficam em `comum.manifest.json`;
- as linhas da tabela do roteiro e os planos do manifest têm o mesmo `id`;
- um clipe gerado tem no máximo 3 s na tela;
- o total do trailer é 60 s.

1. **Clipes** com Wan 2.2 T2V A14B (texto → vídeo), 832×480, 2 s por clipe, ~15 min cada, gerados
   em lote pela CLI (`pnpm generate:trailer-clips`).
2. **Pós-produção** com ffmpeg: 24 fps, câmera lenta 1,5× (cada clipe vira 3 s) e 1080p. Planos
   mais longos que 3 s viram 2 ou 3 clipes encadeados por cortes.
3. **Edição:** gravação de tela do jogo sobre o monitor (versões pt-BR e en da interface), frame
   final nos dois idiomas, trilha e som (o Wan não gera áudio).
