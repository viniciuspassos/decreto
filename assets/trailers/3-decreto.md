# Trailer 3: "Decreto"

Roteiro do miolo (10–55 s). Linguagem comum, abertura (A1–A3), encerramento (E1) e produção em
[comum.md](comum.md).

Ditadura sanguinária → assassinato → povo comemora. É o trailer da tagline. A sensação de poder
cresce até se inverter de uma vez no final.

| # | Tempo | Plano (IA) | Interface |
|---|---|---|---|
| 3.1 | 4 s | Clique. Corte: blindados avançam por uma avenida molhada à noite. | Nó **Militares nas ruas** acende |
| 3.2 | 3 s | Clique. Corte: rotativa de jornal parando; folhas em branco caindo. | Nó **Censura** acende |
| 3.3 | 3 s | Clique. Corte: I2V de `assets/images/eventos/prisao-oposicao.png`; uma porta de cela se fecha. | Nó **Prender opositores** acende |
| 3.4 | 3 s | Clique. Corte: estátua colossal sendo erguida por guindaste (rosto contra a luz). | Nó **Estátuas e retratos obrigatórios** acende |
| 3.5 | 3 s | Desfile militar visto do palanque, em 1ª pessoa: mãos apoiadas na balaustrada, tropas marchando abaixo. | — |
| 3.6 | 2 s | Montagem rápida (0,5 s): nós ficando vermelhos; corredor vazio; cadeira caída numa sala; urnas sendo lacradas. | Nós **Tortura**, **Desaparecimentos**, **Fim das eleições** ficam vermelhos |
| 3.7 | 4 s | Mãos no teclado. As mãos ignoram os alertas. | Grafo todo vermelho; alertas de **revolucionários** piscando |
| 3.8 | 6 s | Gabinete à noite. A porta se abre devagar atrás da câmera; a sombra de um guarda de confiança se projeta sobre a mesa. | — |
| 3.9 | 4 s | Preto. **Um disparo, fora de quadro.** O monitor apaga. | Tela apaga |
| 3.10 | 4 s | Silêncio → rugido de multidão. Praça lotada à noite comemorando, fogos de artifício, bandeiras. | — |
| 3.11 | 4 s | A estátua de 3.4 é derrubada por cordas; o povo sobe nela. Retratos arrancados das paredes. | — |
| 3.12 | 5 s | Gabinete vazio de manhã, janela trincada. Mãos **novas** pousam na mesa e ligam o monitor. | Tela inicial do jogo (eco de A2) |
| | **45 s** | → Encerramento compartilhado | |

Clipes de IA: 14 (a montagem 3.6 tem 4; 3.9 é preto).

## Esboço de montagem v0 (só material existente)

Antes de gerar os clipes do trailer 3, a v0 monta a história só com os clipes dos trailers 1 e 2, o
still `prisao-oposicao.png` e telas do jogo compostas no CRT. Não usa o ComfyUI. Serve para validar o
ritmo e a espinha antes do roteiro final. Arquivo: `assets/trailers/clips/3-decreto/esboco-v0-{pt-BR,en}.mp4`
(fora do git). Total: abertura 6 s + miolo 39 s + encerramento 5 s = **50 s**.

**A espinha é um palíndromo.** A subida é uma sequência de decretos: vigilância, censura, prisão,
retrato e palanque. Depois do disparo, os mesmos planos voltam em ordem inversa e desfeitos:
palanque vazio, a TV do bar de volta, portão abrindo. É a cascata de desfazer do jogo mostrada só
com imagem.

**Cor e som.**
- A nação fica cinza-aço, e só sobrevivem o vermelho e o laranja do regime.
- A trilha é uma só: a marcha do hino do trailer 2, reaproveitada como hino do regime. Ela vem
  abafada da rua quando a câmera volta ao gabinete e é cortada uma vez só, no disparo.
- O primeiro plano em cor plena é a mesma multidão do palanque, diante do púlpito vazio.

**Assassinato sem violência.** O policial da prisão reaparece mais perto. No corredor, as luzes
acendem do fundo para a câmera, cada uma num baque grave: são os passos de alguém chegando. O CRT,
todo vermelho, apaga como TV antiga junto com um disparo abafado fora de quadro.

### Lições dos trailers 1 e 2 aplicadas

| Erro | Solução na v0 |
|---|---|
| Trailer 1 picotado: cena nova a cada 2 s, som em pedaços | 15 planos em 39 s, quase todos de 2,5–3 s; uma marcha contínua, cortada uma vez só |
| Gabinete, monitor e mouse mudando a cada volta à mesa | Só o CRT bege da abertura (a3, 2-11a, 2-05, a2); 1-02a, 1-04, 1-09, 1-10a/b/c e 2-01a ficam fora |
| Bandeiras dos EUA, logos, rostos e texto falso | Saem 1-06, 2-06a, 2-11b, 1-08a, `palanque.png` e `juramento.png`; o retrato de 2-08b fica desfocado; texto do colete, placa e bandeirinhas borrados |
| "Países" diferentes em cada clipe | Letterbox 2.39:1 em toda a nação, grade aço única e grão; gabinete em 16:9 cheio |
| Clímax de final feliz genérico | Sem confete nem pôr do sol: o clímax é o púlpito vazio diante da mesma multidão |

### Miolo (6–45 s)

"1,5×" = câmera lenta com interpolação. Nenhum clipe passa de 3 s na tela.

| # | Tempo | Fonte | Tratamento | Interface | Som |
|---|---|---|---|---|---|
| P1 | 6,0–8,5 | 2-06c | 1,5×, trecho com os drones mais densos, aproximação lenta, céu escuro, bandeirinhas borradas | — | clique de A3; marcha em alto-falante de rua |
| P2 | 8,5–10,5 | 1-03a | letterbox com a TV inteira; o chuvisco ilumina os rostos e, em 9,5 s, a TV e a luz nos rostos apagam | — | clique; o chuvisco morre seco |
| P3 | 10,5–13,0 | still prisao-oposicao | aproximação lenta que termina no policial; giroflex pulsando | — | clique; chuva; a marcha ganha metais |
| P4 | 13,0–15,5 | 1-05b | 1,25×; rima de silhueta de costas com o policial; laranja preservado | — | portão; batida metálica no corte |
| P5 | 15,5–18,0 | 2-08b | 1,25×; cadeiras nítidas na base; retrato desfocado, rosto e texto ilegíveis | — | marcha; relógio |
| P6 | 18,0–21,5 | 1-08b | 1,5× (3,5 s, o mais longo: ápice do poder); palanque com a mão no púlpito | — | marcha cheia + multidão |
| P7 | 21,5–23,5 | a3 (meio) | recorte fechado na tela do CRT | Acendem **Tortura**, **Desaparecimentos**, **Fim das eleições** em vermelho, um por bumbo; no fim, 12 nós vermelhos | 4 bumbos |
| P8 | 23,5–26,0 | 2-11a | 1,5×; luz vermelha de 1 Hz nas mãos, que não se mexem | Grafo todo vermelho; alerta **Revolucionários** pulsando | marcha abafada pela janela; bipe |
| P9 | 26,0–28,0 | still prisao-oposicao | recorte no policial, da cabeça à cintura | — | chuva; bipe |
| P10 | 28,0–31,0 | 1-01 | 1,5×; azul escuro com vinheta e aproximação lenta para o fundo; as luzes piscam | — | um baque grave por clarão (os passos) |
| P11 | 31,0–33,0 | 2-05 | close no CRT, no azul de P8; interface opaca sobre a tela | Três alertas piscando; em 32,6 s o CRT apaga (linha, ponto, preto) | **32,6 s: disparo abafado e seco**; tudo corta junto |
| — | 33,0–35,0 | preto | — | — | silêncio; rumor distante subindo |
| P12 | 35,0–38,0 | 1-08b | 1,5×; recorte com o tampo do púlpito e o microfone, sem a mão: púlpito **vazio**; única imagem quente | — | rugido da multidão, sem música |
| P13 | 38,0–40,5 | 1-03a | 1,25×; o bar de P2: a TV volta e mostra a multidão; rostos iluminados, grade quente | — | rugido abafado; relógio |
| P14 | 40,5–42,5 | 1-05b reverso | o portão abre; mais quente e claro que P4 | — | portão; rugido distante |
| P15 | 42,5–45,0 | a2 | 1,25×; grade de manhã: sombras abertas, menos azul que A2 | Tela inicial **DECRETO** | chuva; CRT liga; corta para e1a |

Fora da v0, além dos já citados: 1-02b, 1-03b, 1-05a, 1-07, 1-08c (redundantes ou de tom
democrático) e as assinaturas do trailer 2 (2-02, 2-04a, 2-07a/b, 2-08a, 2-09c e as utopias).

### Próxima fase: planos novos por image-to-video

Avaliação do roteirista: v0 com nota 7,5/10; teto de ~8 só com montagem. O que falta é material:
o "guarda de confiança" ainda é inferência, a ditadura não tem escala e os drones são o plano mais
genérico. Lista em ordem de prioridade; com os três primeiros, ≥ 9.

| # | Plano | Quadro de referência | Entra na montagem |
|---|---|---|---|
| 1 | 3.8 Sombra do guarda de quepe avançando sobre a mesa; as mãos não se mexem | Quadro de 2-11a | Entre P10 e P11 (sozinho leva a ~8,5) |
| 2 | 3.1 Blindados na avenida molhada, pelo eixo central | `prisao-oposicao.png` | Substitui P1 como gancho |
| 3 | 3.5 Desfile visto do mesmo palanque, à noite, mão na balaustrada | Último quadro de 1-08b | Antes de P6 |
| 4 | Corredor do palácio com as luzes piscando em direção à câmera | V2V de 1-01, mantendo o ritmo dos clarões | Substitui P10 |
| 5 | 3.12 Mãos novas, manhã, janela trincada | Primeiro quadro de A2 | Substitui P15 |
| 6 | Policial subindo a escada do palácio | `prisao-oposicao.png` | Substitui o still de P9 |
| 7 | Opcionais: estátua erguida e tombada (3.4/3.11); porta de cela diante do homem de laranja (3.3); rotativa parando (3.2) | Pátio de 2-06c; 1-05b; still novo | — |

Saíram da lista: fogos sobre a praça (o púlpito vazio de P12 é o clímax), retrato arrancado (P13
virou o bar) e CRT de 2-05 com a tela vazia (a interface opaca resolve).
