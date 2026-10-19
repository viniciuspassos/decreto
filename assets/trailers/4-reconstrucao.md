# Trailer 4: "Reconstrução"

Roteiro do miolo (6–48 s). Linguagem comum, abertura (a1–a3), encerramento (e1a–e1b) e produção em
[comum.md](comum.md). Trilha e som em [4-reconstrucao.trilha.md](4-reconstrucao.trilha.md).

Variação do [trailer 1](1-mandato.md) com o arco invertido: **uma crescente só**. O jogador herda um
país em crise profunda e, mandato após mandato, governa bem, até a nação virar modelo. O trailer 1
termina a um clique da tirania; este termina com a mão **saindo do quadro**, longe do nó que o
trailer 1 quase clicou. A única sombra é esse nó intocado, seguido da tagline comum: ele podia, e
não fez.

**Um trajeto só, da escuridão ao sol.** Em vez de uma colagem de cortes, o trailer é um único
movimento. São 14 planos de 3 s (câmera lenta), e a câmera **sempre avança**. Cada lugar da crise
é curado **no mesmo enquadramento**, por fade. Só há três cortes secos, e eles são os golpes:

1. **O clique no escuro (15–21 s):** a lâmpada do mercado morre, silêncio, o clique, e as luzes do
   hospital acendem no ritmo.
2. **Portão → cortina (27 s):** corte no mesmo gesto lateral. A música passa a Ré maior e o sol
   estoura na lente.
3. **O vale com o sol nascendo (39 s):** o clímax, resolvido.

O fecho é calmo, para a tagline cair sobre o silêncio.

**Ao contrário dos outros trailers, os planos não encurtam:** ficam todos com 3 s e se alongam na
sensação, por fades, à medida que o país sara (ver [linguagem comum](comum.md#linguagem-comum)).

**Perspectiva central.** Corredor, mercado e portão têm o ponto de fuga no centro do quadro e o
mesmo avanço de câmera. Mesmo com seeds diferentes no Wan, os dois lados do fade se sobrepõem
como se fossem um plano só.

**Espelhos, todos dentro do próprio trailer:**

| Crise | Volta como |
|---|---|
| A lâmpada que morre (4-03) | As luzes que acendem (4-05) |
| O mercado vazio (4-03) | O mesmo mercado cheio (4-06), num fade com o ponto de fuga parado |
| O portão fechado na chuva (4-02) | O mesmo portão abrindo ao sol (4-07) |
| A chuva na janela (4-01) | A cortina aberta e o sol (4-08) |
| O grafo cinza e vermelho sob mãos jovens (4-01) | O grafo aceso, com o nó intocado, sob a mão idosa que se retira (4-13/4-14) |

**A luz e a câmera sobem.** A luz vai da noite com chuva ao sol pleno. A câmera vai de mesa → rua →
mercado → janela → praça → rio → cidade → país e volta à mesa.

**Vida imperfeita, não utopia.** O 3º ato não pode lembrar a nação simétrica do
[trailer 2](2-ordem-e-futuro.md). A cidade é vivida e irregular, cada pessoa faz uma coisa e há
roupa no varal. Nenhum rótulo de utopia aparece na tela.

**Passagem do tempo:** a mão, com a **aliança que nunca some**, é jovem (4-01, 4-04), mais velha
(4-08) e idosa (4-13); na tela, "Ano 20".

**Reaproveitamento do trailer 1:** 4-04 e 4-05 são os clipes 1-02a e 1-01, com o mesmo prompt e a
mesma seed no manifest, agora em câmera lenta. Antes do lote, copie-os (o script pula clipes que já
existem):

```sh
mkdir -p assets/trailers/clips/4-reconstrucao && cd assets/trailers/clips && \
for par in 4-04:1-02a 4-05:1-01; do \
  cp "1-mandato/${par#*:}-s42.mp4" "4-reconstrucao/${par%%:*}-s42.mp4"; done
```

**Duração:** cada clipe usa o padrão de 3 s na tela (câmera lenta 1,5×). Com a abertura (6 s) e o
encerramento (5 s), o trailer tem **53 s**. Os prompts ficam em
[`4-reconstrucao.manifest.json`](4-reconstrucao.manifest.json). A coluna **Entra** é a transição
do plano (`transition` no manifest).

| # | Tipo | Tempo | Entra | Plano | Interface |
|---|---|---|---|---|---|
| 4-01 | clip | 3 s | Corte (a tela azul de a3 vira vermelha) | Mãos jovens, com a aliança, paradas na mesa; o monitor as banha de vermelho; chuva na janela. A câmera avança por cima das mãos, em direção à janela. | Grafo todo cinza; indicadores em vermelho; alerta **Recessão** |
| 4-02 | clip | 3 s | Fade, pela chuva | Lá fora, a câmera avança ao longo de uma fila de guarda-chuvas até um portão de fábrica fechado, centralizado; alguns casacos **laranja**. | — |
| 4-03 | clip | 3 s | Corte no movimento | Corredor de mercado vazio, à noite, ponto de fuga no centro. A lâmpada fluorescente pisca e **apaga**; o corredor fica quase preto. | — |
| 4-04 | clip | 3 s | **Corte seco, no escuro** | Close na mão no mouse, com aliança e relógio; **clique**, em câmera lenta. *(= 1-02a)* | — |
| 4-05 | clip | 3 s | **Corte seco, no clique** | As luzes do corredor de hospital acendem uma a uma, empurrando o escuro; a câmera avança. *(= 1-01)* | — |
| 4-06 | clip | 3 s | Fade, mesmo ponto de fuga | O mercado de 4-03, agora **cheio**, com luz quente de começo de manhã; alguns clientes de costas ao fundo. | — |
| 4-07 | clip | 3 s | Fade | Nascer do sol: a câmera avança para o portão de 4-02, que **desliza aberto da esquerda para a direita**; os operários de laranja esperam, de costas. | — |
| 4-08 | clip | 3 s | **Corte no gesto (portão → cortina)** | No gabinete, uma mão **mais velha**, com a aliança, puxa a cortina da esquerda para a direita; o sol inunda a lente. | — |
| 4-09 | clip | 3 s | Fade, a partir do branco do sol | Praça vivida e ensolarada; a câmera avança na altura dos olhos, com crianças correndo à frente; feira, varais. | — |
| 4-10 | clip | 3 s | Corte na ação (correr → saltar) | Câmera lenta, vista lateral: jovens correm pelo píer e saltam num rio limpo; a água estoura ao sol. | — |
| 4-11 | clip | 3 s | Corte casado na água | Plano aéreo subindo e avançando sobre o rio que corta a cidade vivida. | — |
| 4-12 | clip | 3 s | Fade, a câmera segue em frente | O voo passa a crista do morro e revela o vale, com **o sol nascendo no centro do quadro**; vila, campos, trem na ponte. **Clímax.** | — |
| 4-13 | clip | 3 s | Fade, de sol para sol | Gabinete ao sol, janela aberta atrás do monitor (o sol no mesmo ponto do quadro), cortina ao vento; a mão idosa, com a aliança, parada no mouse. | Grafo todo aceso; **um único nó cinza no centro: Reeleição ilimitada**, pulsando de leve; cursor longe; **Ano 20** pequeno |
| 4-14 | clip | 3 s | Fade (a pausa para decidir) | Mesmo quadro: a mão solta o mouse e sai por baixo; sobra o mouse sozinho ao sol. | idem |
| | | **42 s** | | → Encerramento compartilhado (48–53 s) | |

**Notas de produção:**
- **Sentido dos gestos.** O Wan não garante o sentido do movimento (portão e cortina para a
  direita, crianças correndo). Se vier invertido, espelhe o clipe na pós (`hflip` no ffmpeg). Não
  há texto em quadro, então espelhar é seguro.
- **A lâmpada (4-03):** se o Wan não a apagar, escureça o último 0,5 s na edição.
- **4-13 → 4-14:** são duas gerações; o fade de 0,5 s esconde a diferença de enquadramento.

Clipes de IA: 14, sendo 2 reaproveitados do trailer 1 e **12 novos** (~3 h de lote).
