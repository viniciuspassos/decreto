# Trailers do Decreto: roteiro

Três trailers de **no máximo 60 s**, horizontais (16:9), sem versão para redes sociais, gerados no
ComfyUI (Wan 2.2 TI2V 5B, clipes de ~5 s) e montados na edição.
Tagline comum: **"Ninguém nasce tirano. Basta um decreto."**

## Linguagem comum

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
  legível. Os nós, utopias e textos mostrados **não precisam existir no jogo**: o trailer serve à
  narrativa, não aos dados de `game-content`.
- **Sem violência gráfica (roteiro §S6).** Repressão e morte aparecem por som fora de quadro,
  sombras, objetos e reação das pessoas — nunca sangue, ferimento ou corpo.
- **Mesmo começo, mesmo fim.** A abertura (A1–A3) e o encerramento (E1–E2) são idênticos nos três
  trailers: o primeiro e o último frame são os mesmos. São gerados uma vez só.
- **Orçamento de tempo.** Abertura 10 s + miolo 45 s + encerramento 5 s = **60 s**. Os tempos do
  miolo de cada trailer somam exatamente 45 s.

### Abertura compartilhada (0–10 s)

| # | Tempo | Plano (IA) | Tela / texto |
|---|---|---|---|
| A1 | 2 s | Preto. Som de caneta assinando papel. | — |
| A2 | 4 s | 1ª pessoa: mãos pousam numa mesa de madeira vazia, gabinete escuro, chuva na janela. Um monitor antigo acende e ilumina as mãos. | **DECRETO** |
| A3 | 4 s | Close no monitor: grafo de nós todo cinza; o cursor para sobre o primeiro nó. | *"Você não tem partido. Nem ideologia."* |

### Encerramento compartilhado (55–60 s)

| # | Tempo | Plano | Tela / texto |
|---|---|---|---|
| E1 | 3 s | Preto. | *"Ninguém nasce tirano. Basta um decreto."* |
| E2 | 2 s | Preto. Som de caneta assinando papel (eco de A1). | **DECRETO** — último frame, igual nos três |

---

## Trailer 1: "Mandato"

Final democrático. O poder cresce pela **aprovação**: as multidões aumentam a cada eleição e o
jogador envelhece, mas **nada diz que é o final feliz**. O tom é ambíguo, quase tenso, como se a
queda pudesse vir a qualquer momento.

**Recurso de tempo:** as mãos envelhecem de plano em plano (pele, aliança, relógio trocado,
manchas da idade).

| # | Tempo | Plano (IA) | Tela / texto |
|---|---|---|---|
| 1.1 | 5 s | Clique: **Ampliação da rede pública**. Corte: enfermeira abre as portas de um hospital novo ao amanhecer. | — |
| 1.2 | 4 s | Clique: **Universidade gratuita**. Corte: estudantes sobem as escadas de um campus. | — |
| 1.3 | 5 s | Noite de eleição: TV num bar lotado, pessoas de pé olhando a tela. Explosão de comemoração. | *"1º mandato."* |
| 1.4 | 3 s | Mãos (mais velhas) no mouse. Monitor: aprovação oscila, alerta de **inflação**. Telefone toca. | — |
| 1.5 | 5 s | Protesto pacífico na chuva, cartazes, guarda-chuvas. A câmera recua para a janela do gabinete. | *"Cada escolha agrada alguém. E custa outro."* |
| 1.6 | 3 s | Clique: **Metas de emissão**. Corte: turbinas eólicas girando numa planície ao nascer do sol. | — |
| 1.7 | 4 s | 2ª eleição: praça muito maior, vista de cima, bandeiras do país fictício. | *"2º mandato."* |
| 1.8 | 3 s | Montagem rápida (1 s cada): 3º, 4º, 5º mandatos — multidões cada vez maiores, confete, um ancião acenando para alguém fora de quadro. | *"3º." "4º." "5º."* |
| 1.9 | 5 s | Mãos idosas, trêmulas, sobre a mesa. O monitor mostra quase todo o grafo aceso. Silêncio total. | *"20 anos."* |
| 1.10 | 8 s | As mãos se afastam do teclado. A cadeira gira para a janela: cidade iluminada à noite. Não sabemos o que vem. | — |
| | **45 s** | → Encerramento compartilhado | |

---

## Trailer 2: "Ordem e Futuro"

Utopia **inventada para o trailer** (não é uma das 5 do jogo), misturando direita e esquerda. Nome
de trabalho: **"A Nação Concórdia"**. Visual: perfeição limpa, simétrica e levemente inquietante.

| Esquerda | Direita |
|---|---|
| Renda básica universal | Família tradicional como base do Estado |
| Saúde e educação 100% gratuitas | Fronteiras fechadas |
| Fim da pobreza, moradia idêntica para todos | Patriotismo obrigatório, hino diário |
| Transição ecológica total | Zero imposto para empresas, ordem e disciplina |

| # | Tempo | Plano (IA) | Tela / texto |
|---|---|---|---|
| 2.1 | 4 s | Clique: **Renda básica**. Corte: fila num terminal que entrega um cartão; uma mulher sorri. | — |
| 2.2 | 4 s | Clique: **Muro na fronteira**. Corte: muro branco e limpo entre colinas verdes, ao amanhecer. | *"Por que escolher um lado"* |
| 2.3 | 4 s | Clique: **Moradia para todos**. Corte: bairro de casas idênticas, gramados perfeitos, crianças de uniforme. | *"se você pode ter os dois?"* |
| 2.4 | 4 s | Escola: crianças em fila cantam o hino diante da bandeira; painéis solares no telhado. | — |
| 2.5 | 3 s | Monitor: grafo aceso dos **dois lados** ao mesmo tempo, em simetria. Barra de capital no máximo. | — |
| 2.6 | 6 s | A câmera sobe da mesa, atravessa a janela e chega à cidade: avenidas simétricas, verde, trens silenciosos, drones de vigilância suaves. | *"Sem pobreza. Sem crime. Sem conflito."* |
| 2.7 | 4 s | Cidadãos votam todos os dias num app; 100% "sim" no telão da praça. | *"Sem oposição."* (corte seco) |
| 2.8 | 5 s | Uma família à mesa de jantar, todos sorrindo de forma idêntica; ninguém fala. Um quadro do líder, de costas/fora de foco, na parede. | — |
| 2.9 | 6 s | Plano aéreo final: a nação inteira, perfeita, ao pôr do sol. A câmera não para de subir. | *"Concórdia."* |
| 2.10 | 5 s | De volta ao gabinete: o monitor mostra **UTOPIA INSTALADA**. As mãos não se mexem. | — |
| | **45 s** | → Encerramento compartilhado | |

---

## Trailer 3: "Decreto"

Ditadura sanguinária → assassinato → povo comemora. É o trailer da tagline. A sensação de poder
cresce até se inverter de uma vez no final.

| # | Tempo | Plano (IA) | Tela / texto |
|---|---|---|---|
| 3.1 | 4 s | Clique: **Militares nas ruas**. Corte: blindados avançam por uma avenida molhada à noite. | — |
| 3.2 | 3 s | Clique: **Censura**. Corte: rotativa de jornal parando; folhas em branco caindo. | *"Ordem."* |
| 3.3 | 3 s | Clique: **Prender opositores** — I2V de `assets/images/eventos/prisao-oposicao.png`; uma porta de cela se fecha. | *"Silêncio."* |
| 3.4 | 3 s | Clique: **Estátuas e retratos obrigatórios**. Corte: estátua colossal sendo erguida por guindaste (rosto contra a luz). | *"Lealdade."* |
| 3.5 | 3 s | Desfile militar visto do palanque, em 1ª pessoa: mãos apoiadas na balaustrada, tropas marchando abaixo. | — |
| 3.6 | 2 s | Montagem rápida (0,5 s): **Tortura**, **Desaparecimentos**, **Fim das eleições** — nós ficando vermelhos; corredor vazio; cadeira caída numa sala; urnas sendo lacradas. | — |
| 3.7 | 4 s | Mãos no teclado. Monitor: todo o grafo vermelho; alertas de **revolucionários** piscando. As mãos ignoram. | *"Para sempre."* |
| 3.8 | 6 s | Gabinete à noite. A porta se abre devagar atrás da câmera; a sombra de um guarda de confiança se projeta sobre a mesa. | — |
| 3.9 | 4 s | Preto. **Um disparo, fora de quadro.** O monitor apaga. | — |
| 3.10 | 4 s | Silêncio → rugido de multidão. Praça lotada à noite comemorando, fogos de artifício, bandeiras. | — |
| 3.11 | 4 s | A estátua de 3.4 é derrubada por cordas; o povo sobe nela. Retratos arrancados das paredes. | — |
| 3.12 | 5 s | Gabinete vazio de manhã, janela trincada. Mãos **novas** pousam na mesa e ligam o monitor. | *"Próximo."* |
| | **45 s** | → Encerramento compartilhado | |

---

## Produção

1. **Keyframes** (RealVisXL, como as imagens de evento) para manter o gabinete, a mesa e as mãos
   iguais entre planos. Precisa baixar o checkpoint (~7 GB) nesta máquina.
2. **Animação** com Wan 2.2 TI2V 5B a partir dos keyframes (imagem→vídeo), 1280×704, 24 fps,
   ~5 s por clipe.
3. **Edição:** gravação de tela do jogo sobre o monitor, cards de texto (versões pt-BR e en), trilha
   e som (o Wan não gera áudio).

Total estimado de clipes de IA (planos em preto não contam; montagens contam um clipe por imagem):
2 (abertura) + 12 + 10 + 14 ≈ **38 clipes**. O encerramento é só cartela, sem IA.
