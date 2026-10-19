# Trailer 4: "Reconstrução"

Roteiro do miolo (6–43 s). Linguagem comum, abertura (a1–a3), encerramento (e1a–e1b) e produção em
[comum.md](comum.md). Trilha e som em [4-reconstrucao.trilha.md](4-reconstrucao.trilha.md).

Variação do [trailer 1](1-mandato.md) com o arco invertido: **uma crescente só**. O jogador herda um
país em crise profunda e, mandato após mandato, governa bem, até a nação virar modelo. O trailer 1
termina a um clique da tirania; este termina com a mão **saindo do quadro**, longe do nó que o
trailer 1 quase clicou. A única sombra é esse nó intocado, seguido da tagline comum: ele podia, e
não fez.

**Espelhos.** Cada imagem da crise volta transformada mais adiante, para a recuperação aparecer na
imagem e não em texto:

| Crise | Volta como |
|---|---|
| Prateleiras vazias (4-01) | Prateleiras cheias sendo abastecidas (4-07) |
| Fila na chuva diante de um portão de fábrica fechado, alguns casacos **laranja** (4-02) | O mesmo portão abrindo para operários de laranja (4-08) |
| Monitor vermelho sobre mãos jovens (4-03) | Monitor ao sol; a mão idosa solta o mouse e sai do quadro (4-16a–b) |
| Hospital escuro acendendo (4-05) | O mesmo corredor de dia (4-14b) |
| Sala de aula lotada, gente de pé (4-06) | A mesma sala de dia, todos sentados, carteiras sobrando (4-14a) |

**A luz sobe.** O gabinete começa escuro e chuvoso, como na abertura comum. A chuva para no 2º ato
(amanhecer) e, no 3º, a janela se abre e o sol entra até a mesa. Os prompts mudam de estilo junto:
frio e escuro → luz de amanhecer → luz do dia. O bar da eleição (4-10a–b) é o último escuro; na
correção de cor, esquentar o 4-10b e deixar 4-04 a 4-06 frios.

**Vida imperfeita, não utopia.** O 3º ato não pode lembrar a nação simétrica do
[trailer 2](2-ordem-e-futuro.md): cidade vivida, irregular, cada pessoa fazendo uma coisa, roupa no
varal. Nada de grade, simetria ou câmera subindo sem parar, e nenhum rótulo de utopia na tela.

**A câmera sobe** (ver [linguagem comum](comum.md#linguagem-comum)): mercado (4-01) → portão
(4-02) → mesa (4-03) → praça (4-12) → cidade (4-13) → país (4-15). O fecho volta à mesa.

**Recurso de tempo:** como no trailer 1, as mãos envelhecem de plano em plano. A diferença: a
**aliança nunca some** (4-03, 4-04, 4-11, 4-16a–b).

**Reaproveitamento do trailer 1.** Seis planos são os mesmos clipes do trailer 1, com o mesmo
prompt e a mesma seed no manifest. Antes do lote, copie os arquivos (o script pula clipes que já
existem):

| Plano | Clipe do trailer 1 |
|---|---|
| 4-04 | `clips/1-mandato/1-02a-s42.mp4` |
| 4-05 | `clips/1-mandato/1-01-s42.mp4` |
| 4-06 | `clips/1-mandato/1-02b-s42.mp4` |
| 4-09 | `clips/1-mandato/1-05a-s42.mp4` |
| 4-10a | `clips/1-mandato/1-03a-s42.mp4` |
| 4-10b | `clips/1-mandato/1-03b-s42.mp4` |

```sh
mkdir -p assets/trailers/clips/4-reconstrucao && cd assets/trailers/clips && \
for par in 4-04:1-02a 4-05:1-01 4-06:1-02b 4-09:1-05a 4-10a:1-03a 4-10b:1-03b; do \
  cp "1-mandato/${par#*:}-s42.mp4" "4-reconstrucao/${par%%:*}-s42.mp4"; done
```

**Duração por clipe:** como no trailer 1, cada clipe fica **2 s** na tela (`seconds: 2`), e a
montagem 4-14 usa 1 s de cada. Com a abertura (6 s) e o encerramento (5 s), o trailer tem **48 s**.
Os prompts ficam em [`4-reconstrucao.manifest.json`](4-reconstrucao.manifest.json).

| # | Tipo | Tempo | Plano | Interface |
|---|---|---|---|---|
| 4-01 | clip | 2 s | Corredor de mercado à noite, prateleiras vazias, uma lâmpada fluorescente piscando. | — |
| 4-02 | clip | 2 s | Fila longa de guarda-chuvas na chuva diante de um portão de fábrica fechado, vista de trás; alguns casacos **laranja**. | — |
| 4-03 | clip | 2 s | Mãos jovens, com a **aliança**, paradas na mesa; o monitor as banha de luz vermelha. Chuva na janela. | Grafo cinza; todos os indicadores em vermelho; alerta **Recessão** |
| 4-04 | clip | 2 s | Close na mão no mouse: **aliança e relógio** visíveis. Clique. *(= 1-02a)* | — |
| 4-05 | clip | 2 s | Corte: luzes quentes de um corredor de hospital se acendem, uma a uma. *(= 1-01)* | Nó **Ampliação da rede pública** acende |
| 4-06 | clip | 2 s | Corte: sala de aula lotada, gente de pé no fundo. *(= 1-02b)* | Nó **Universidade gratuita** acende |
| 4-07 | clip | 2 s | Mãos de um repositor enchem uma prateleira de pão; o corredor atrás já está cheio. | — |
| 4-08 | clip | 2 s | Amanhecer: o portão de 4-02 **abre**; os operários de laranja esperam, de costas. | — |
| 4-09 | clip | 2 s | Turbinas eólicas girando ao nascer do sol. *(= 1-05a)* | Nó **Metas de emissão** acende |
| 4-10a | clip | 2 s | Noite de eleição, bar lotado olhando a TV. *(= 1-03a)* | — |
| 4-10b | clip | 2 s | Corte seco: explosão de confete. *(= 1-03b)* | — |
| 4-11 | clip | 2 s | Na janela do gabinete, de manhã: uma mão mais velha, com a aliança, abre a cortina; o sol entra. | — |
| 4-12 | clip | 2 s | Praça ensolarada e vivida: famílias, crianças correndo, uma feira, roupa nas varandas. | — |
| 4-13 | clip | 2 s | Plano aéreo da cidade de dia: telhados irregulares, parques cheios, ruas arborizadas. | — |
| 4-14a | clip | 1 s | Montagem: a sala de aula de 4-06, de dia, todos sentados, algumas carteiras sobrando. | — |
| 4-14b | clip | 1 s | Montagem: o corredor de 4-05, de dia, uma enfermeira passando. | — |
| 4-14c | clip | 1 s | Montagem: jovens pulam num rio limpo. | — |
| 4-15 | clip | 2 s | O país: vale verde ao nascer do sol, uma cidade pequena, um trem cruzando a ponte. | — |
| 4-16a | clip | 2 s | Gabinete ao sol, janela aberta, cortina ao vento. O monitor e a mão idosa, **com a aliança**, parada no mouse. | Grafo todo aceso; **um único nó cinza no centro: Reeleição ilimitada**, com um leve pulso; cursor longe dele; **Ano 20** pequeno no canto |
| 4-16b | clip | 2 s | Mesmo quadro: a mão solta o mouse e sai por baixo do quadro. Sobra o mouse sozinho na mesa. | idem |
| | | **37 s** | → Encerramento compartilhado | |

Clipes de IA: 20, sendo 6 reaproveitados do trailer 1 e **14 novos** (~3,5 h de lote). A montagem
4-14 tem 3 clipes de 1 s.
