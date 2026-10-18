# Trailer 1: "Mandato" — roteiro da trilha sonora

Trilha e som do trailer 1. A ordem e a duração dos planos seguem o
[`1-mandato.manifest.json`](1-mandato.manifest.json) e o [`comum.manifest.json`](comum.manifest.json).
Narrativa de cada plano em [1-mandato.md](1-mandato.md); base comum em [comum.md](comum.md).

Sem diálogo, sem narração, sem voz inteligível. Só **música** (instrumental) e **som ambiente** da
cena. Mesmo áudio nas versões pt-BR e en.

## Linha do tempo

Cada clipe fica **2 s** na tela (`seconds: 2`); os planos 1-08a–c têm `seconds: 1`. O encerramento
é `e1a` (preto, 3 s) e `e1b` (frame final, 2 s).

| id | Tempo | id | Tempo | id | Tempo |
|---|---|---|---|---|---|
| a1 (preto) | 0–2 s | 1-03b | 14–16 s | 1-08c | 28–29 s |
| a2 | 2–4 s | 1-04 | 16–18 s | 1-09 | 29–31 s |
| a3 | 4–6 s | 1-05a | 18–20 s | 1-10a | 31–33 s |
| 1-01 | 6–8 s | 1-05b | 20–22 s | 1-10b | 33–35 s |
| 1-02a | 8–10 s | 1-06 | 22–24 s | 1-10c | 35–37 s |
| 1-02b | 10–12 s | 1-07 | 24–26 s | e1a (preto) | 37–40 s |
| 1-03a | 12–14 s | 1-08a | 26–27 s | e1b (frame final) | 40–42 s |
| | | 1-08b | 27–28 s | **Total** | **42 s** |

## Intenção

A trilha cresce junto com as vitórias, mas nunca vira "final feliz". Cada subida tem um custo logo
depois: um piano desafinado, um corte seco, um protesto. O clímax musical vem **antes** do gancho.
O momento mais tenso (1-10) é o **silêncio**: só chuva e o tique do relógio. O impacto é a música
sumir.

| Ato | Tempo | Planos | O que a trilha faz | Intensidade |
|---|---|---|---|---|
| Abertura | 0–6 s | a1–a3 | Sem música. Caneta, chuva, monitor acendendo. Um *swell* grave sobe até 6 s. | 1 → 3 |
| 1º mandato | 6–16 s | 1-01 – 1-03b | Piano sozinho apresenta o motivo; cordas entram; pulso no bar; primeiro *hit* no confete. | 2 → 6 |
| O custo | 16–24 s | 1-04 – 1-06 | Leito abafado e piano desafinado; corte seco no portão; o leito volta no protesto. | 4 → 5 |
| Escalada | 24–31 s | 1-07 – 1-09 | Metais, tambores, multidão; um *hit* por corte na montagem; clímax sem resolver sobre as mãos idosas. | 7 → 10 |
| Gancho | 31–37 s | 1-10a – 1-10c | **Corte seco para silêncio** em 31,0 s. Só chuva; depois o tique do relógio e o tremor. Silêncio total em 37,0 s. | 1 → 2 |
| Encerramento | 37–42 s | e1a–e1b | Silêncio, caneta (mesmo arquivo de a1), *hit* grave no frame final. | 0 → 4 |

### Decisões globais

| Item | Decisão |
|---|---|
| Modelo | **Stable Audio 3.0 Medium** no ComfyUI local, para música e efeitos (ver [geração](#geração)). |
| Andamento | **120 BPM**, 4/4. Uma batida = 0,5 s; um compasso = 2 s = **um clipe**. |
| Grade | Começa em **0,0 s**. O trailer tem 84 batidas = 21 compassos. Até 1-08a (26 s), todo corte cai no tempo 1 do compasso. A montagem de 1 s desloca a grade em meio compasso: de 1-08b em diante (27, 29, 31, 33, 35 e 37 s) os cortes caem no tempo 3; o frame final (40 s) volta ao tempo 1. |
| Tom | **Ré menor**. As subidas de "vitória" usam Fá e Si♭ maior, nunca uma cadência que resolve em Ré maior. |
| Paleta | Piano de feltro (o presidente), cordas, violoncelos, metais graves, tímpano e tambores. Sem coro (é voz), sem guitarra, sem batida eletrônica. |
| Motivo | 4 notas, uma por segundo: **Ré – Lá – Sol – Fá**. Sobe com esperança e desce sem voltar à tônica. Ocupa 1-01 e 1-02a (6–10 s). |
| Envelhecimento | O motivo envelhece com as mãos: limpo em 1-01; desafinado em 1-04; afinação baixa e *wow/flutter* de fita em 1-09. É sempre o **mesmo** arquivo de piano, processado na edição. |

**Por que 120 BPM.** Os planos têm 2 s e 1 s. A 120 BPM, 2 s = 4 batidas (1 compasso) e 1 s =
2 batidas: todo corte cai numa batida inteira. A 90 BPM, 2 s = 3 batidas e 1 s = 1,5 (não fecha);
a 60 BPM fecha, mas é lento demais para a escalada. No 1º mandato o piano toca em *half-time*
(sensação de 60 BPM) sem sair da grade.

### Música: um leito contínuo

Cada plano dura 2 s. Música gerada em pedaços de 2 s, cada um com timbre e mixagem próprios, soaria
picotada. Por isso a música sai de **um leito contínuo** (`1-m-leito`), gerado de uma vez com o arco
inteiro (piano → cordas → pulso → metais e tambores → clímax). Os contrastes do roteiro (a queda em
1-04, o portão mudo em 1-05b e o corte em 31 s) são feitos **na edição, sobre esse leito**. Peças
avulsas só onde a separação ajuda: o motivo de piano, o violoncelo, os *hits* e o *riser*.

O modelo não recebe marcações de tempo. Geram-se algumas seeds do leito e escolhe-se a que tem o
arco mais perto da linha do tempo; na edição, compassos (2 s) ou meios compassos (1 s) podem ser
cortados ou repetidos para alinhar a entrada dos metais a 24 s e o clímax a 29 s.

## Tabela por plano

| id | Tempo | Música | Som ambiente | Sincronia | Int. |
|---|---|---|---|---|---|
| a1 | 0–2 s | — | Caneta assinando papel, perto, seco. | Caneta começa em 0,0 s. | 1 |
| a2 | 2–4 s | — | Chuva na janela; mãos pousando na madeira; *room tone* do gabinete; CRT ligando. | Estalo do CRT no quadro em que a tela acende. | 2 |
| a3 | 4–6 s | `c-swell` grave sobe (atonal, comum aos 3 trailers). | Chuva, zumbido do CRT, mouse deslizando. | *Swell* termina seco em 6,0 s. | 3 |
| 1-01 | 6–8 s | Leito começa: piano sozinho, motivo Ré–Lá. | Luzes do hospital acendendo: estalos de relé e zumbido quente. | 1ª nota em 6,0 s; estalos realinhados às batidas. | 2 |
| 1-02a | 8–10 s | Motivo termina: Sol–Fá. | Clique do mouse; tique leve do relógio. | Clique numa batida (8,0 ou 9,0 s, a mais próxima do gesto). | 3 |
| 1-02b | 10–12 s | Cordas entram, Si♭ maior. | Sala de aula cheia: murmúrio indistinto, cadeiras. | Cordas em 10,0 s. | 3 |
| 1-03a | 12–14 s | Pulso grave de tambor; `1-riser` de 2 s. | Bar lotado: murmúrio, copos, TV abafada (só tom). | *Riser* chega ao pico em 14,0 s. | 5 |
| 1-03b | 14–16 s | `1-hit-vitoria` + leito cheio em Fá maior: primeira vitória. | Confete, comemoração indistinta, aplausos. | *Hit* em 14,0 s, junto com o corte. | 6 |
| 1-04 | 16–18 s | Leito abafado (passa-baixa, −18 dB); por cima, o início do motivo **desafinado**. | Bipe de alerta da interface; tique do relógio. | Queda em 16,0 s; bipe a cada 2 batidas. | 4 |
| 1-05a | 18–20 s | Leito volta inteiro, ostinato de cordas. | Clique; turbinas girando; pássaros longe. | Clique e leito em 18,0 s. | 5 |
| 1-05b | 20–22 s | **Leito mudo** (corte seco); só `1-m-celo` grave, bem baixo. | Portão de fábrica rolando e batendo; vento. | Corte em 20,0 s; batida do portão no fim do gesto. | 4 |
| 1-06 | 22–24 s | Leito volta, no ponto em que estaria (a peça corre por baixo, muda). | Chuva na janela; protesto pacífico abafado pelo vidro: palmas e vozes indistintas. | Volta em 22,0 s; palmas realinhadas às batidas. | 5 |
| 1-07 | 24–26 s | Metais graves e tambores entram; `1-riser` de 2 s. | Multidão grande na praça; púlpito rangendo. | *Riser* termina em 26,0 s. | 7 |
| 1-08a | 26–27 s | **Hit 1**. | Confete + multidão. | *Hit* em 26,0 s. | 8 |
| 1-08b | 27–28 s | **Hit 2**, maior. | Confete + multidão maior. | *Hit* em 27,0 s. | 9 |
| 1-08c | 28–29 s | **Hit 3**, maior ainda. | Confete + multidão ainda maior. | *Hit* em 28,0 s. | 9 |
| 1-09 | 29–31 s | **Clímax**: leito no pico, *hit* 4, motivo no piano envelhecido por cima; acorde sem resolver. | Mãos trêmulas na madeira, quase inaudíveis. | *Hit* em 29,0 s; **corte seco em 31,0 s, sem cauda de reverb**. | 10 |
| 1-10a | 31–33 s | **Nenhuma.** | **Só chuva.** | Silêncio musical exato em 31,0 s. | 1 |
| 1-10b | 33–35 s | Nenhuma. | Chuva; tique do relógio (1 por segundo); mouse tremendo na mesa. | Tiques em 33,0; 34,0 s: o pulso continua só no relógio. | 2 |
| 1-10c | 35–37 s | Nenhuma. | Chuva mais perto e abafada; tique mais alto; tremor. | Tiques em 35,0; 36,0 s. **Tudo corta em 37,0 s**, antes do clique. | 2 |
| e1a | 37–40 s | Nenhuma. | Silêncio 0,5 s; caneta (mesmo arquivo de a1) de 37,5 a 39,5 s; silêncio 0,5 s. | Caneta começa em 37,5 s. | 0 → 1 |
| e1b | 40–42 s | `c-hit-final`. | — | *Hit* em 40,0 s (compasso 21), junto com o frame final; cauda até 42,0 s. | 4 |

## Geração

Todas as peças saem do **Stable Audio 3.0 Medium** no ComfyUI local. Teste de 18/10/2026 neste Mac
(M4 Pro, 24 GB): 60 s de áudio em **25 s**, com ~5 GB de memória.

- **Workflow:** [`_audio.api.json`](_audio.api.json), no formato API do ComfyUI. Por peça, troque o
  prompt (nó `6`), a duração em segundos (nó `11`), a seed (nó `3`) e o nome do arquivo (nó `57`).
  O prompt vai direto para o codificador T5Gemma, sem a reescrita pelo Qwen do template oficial: 8
  passos, cfg 1, `lcm`/`simple`. O template oficial não roda pela CLI, porque o seletor de categoria
  dele só tem opções na interface.
- **Onde ficam:** `~/ComfyUI-Shared/output/audio/trilha/<trailer>/<peça>-s<seed>_00001.flac` (as
  peças comuns em `trilha/comum/`). Fora do repo, como os clipes de vídeo.
- **Seeds geradas:** 42 e 43 em todas as peças; 42 a 45 em `1-m-leito` e `1-m-piano`. Escolha
  atual, a confirmar ouvindo: `1-m-leito` **s43** (a que mais cresce até o fim), `1-m-piano`
  **s43** (4 notas de 1 s, sobe e desce, como o motivo); as demais, **s42**.
- **Uma peça por arquivo.** Transições, cortes secos e *hits* são feitos na edição.
- **Gerar com sobra:** o modelo costuma terminar o som 1–2 s antes da duração pedida (o fim do
  arquivo sai mudo). A coluna "Gerar" já inclui essa margem e a folga para escolher o trecho que
  encaixa na grade.
- **Várias seeds para as peças principais** (`1-m-leito`, `1-m-piano`): é barato (menos de 30 s
  cada) e o arco muda bastante de uma seed para outra.
- **Sem voz inteligível, sem letra, sem coro, sem marca.** Multidão é murmúrio, aplauso e grito
  indistinto. Nada de tiro, explosão ou grito de dor.
- Prompts em inglês, no formato *estilo + instrumentos + camadas + percussão + mood. BPM. Length.*
  Os de efeitos não têm BPM.

### Peças comuns (abertura e encerramento): reaproveitar nos trailers 2 e 3

São atonais ou ambientes, sem tom nem andamento, para servirem a qualquer trilha.

| Peça | Tipo | Gerar / usar | Onde entra | Prompt |
|---|---|---|---|---|
| `c-caneta` | Efeito | 6 s / 2 s | a1, e1a | `Close-up foley of a fountain pen signing a signature on thick paper on a wooden desk, slow deliberate strokes, scratch of the nib, quiet office room, dry, intimate, no music. Length: 6 seconds` |
| `c-chuva` | Ambiente | 30 s / em loop | a2, a3, 1-06, 1-10a–c | `Interior ambience of steady rain against a large office window at night, droplets on glass, soft gutter trickle, distant low city hush, no thunder, no music, calm and heavy. Length: 30 seconds` |
| `c-gabinete` | Ambiente | 20 s / em loop | a2, a3, 1-04, 1-09, 1-10b–c | `Quiet room tone of an old wood-paneled office at night with the faint high-pitched hum of an old CRT monitor, subtle electrical buzz, no music, no voices. Length: 20 seconds` |
| `c-maos-mesa` | Efeito | 2 s / 1 s | a2 | `Foley of two hands gently placed flat on a solid wooden desk, soft thud and fabric rustle of suit sleeves, close and dry. Length: 2 seconds` |
| `c-crt-liga` | Efeito | 3 s / 2 s | a2 | `An old CRT computer monitor powering on: a deep electrical thunk, a short degauss buzz, then a rising high-pitched whine settling into a hum. Length: 3 seconds` |
| `c-mouse-clique` | Efeito | 2 s / 0,2 s | 1-02a, 1-05a | `Single close-up click of an old computer mouse button on a wooden desk, crisp plastic click, dry, no room reverb, then silence. Length: 2 seconds` |
| `c-mouse-desliza` | Efeito | 3 s / 2 s | a3, 1-10a (baixo, opcional) | `Slow slide of an old computer mouse across a mouse pad on a wooden desk, soft friction, close and quiet. Length: 3 seconds` |
| `c-swell` | Efeito | 4 s / 2 s | a3 | `Cinematic low sub-bass swell rising slowly with a dark airy texture, reversed cymbal and deep rumble building tension, no melody, atonal, ends abruptly at the peak. Length: 4 seconds` |
| `c-hit-final` | Efeito | 4 s / 2 s | e1b (40,0 s) | `Single cinematic low impact: deep sub boom with a dark low rumble, long dark decay, solemn, atonal, no melody. Length: 4 seconds` |

### Peças do trailer 1: música

| Peça | Tipo | Gerar / usar | Onde entra | Prompt |
|---|---|---|---|---|
| `1-m-leito` | Música | 34 s / 25 s (6–31) | 1-01 – 1-09 | `Cinematic orchestral trailer score that builds in one continuous arc: opens with a sparse solo felt piano in long notes, then warm strings enter, then a pulsing low drum and a driving string ostinato in eighth notes, then low brass, french horns and big taiko drums rising into a massive sustained climax chord that does not resolve. Emotional and hopeful yet uneasy, no choir, no vocals. Key: D minor. BPM: 120. Length: 34 seconds` |
| `1-m-piano` | Música | 8 s / 4 s, reaproveitado | 1-01 – 1-02a (limpo, sobre o leito), 1-04 e 1-09 (processado) | `Solo felt piano playing a slow four-note motif, one long note per second, descending after rising, sparse and intimate, soft room, no other instruments. Key: D minor. BPM: 120, half-time feel. Length: 8 seconds` |
| `1-m-celo` | Música | 4 s / 2 s | 1-05b | `Single solo cello holding one low sustained note, very quiet, bleak, slight bow noise, no other instruments. Key: D minor. Length: 4 seconds` |

### Peças do trailer 1: hits e riser

| Peça | Tipo | Gerar / usar | Onde entra | Prompt |
|---|---|---|---|---|
| `1-hit-vitoria` | Efeito | 3 s / 2 s | 1-03b (14,0 s) | `Cinematic orchestral hit: timpani strike, crash cymbal and bright brass stab together, short tail, celebratory. Key: D minor. Length: 3 seconds` |
| `1-hit-montagem` | Efeito | 2 s / 1 s, ×4 | 1-08a, 1-08b, 1-08c, 1-09 (26, 27, 28, 29 s) | `Huge cinematic trailer impact: deep orchestral drum hit with low brass stab and cymbal crash, punchy, short decay. Length: 2 seconds` |
| `1-riser` | Efeito | 4 s / 2 s, ×2 | 1-03a (12–14 s), 1-07 (24–26 s) | `Cinematic riser: rising string tremolo and reversed cymbal swelling into tension, accelerating, cuts off at the peak, no impact at the end. Length: 4 seconds` |

### Peças do trailer 1: ambientes por plano

| Peça | Tipo | Gerar / usar | Onde entra | Prompt |
|---|---|---|---|---|
| `1-a-hospital` | Ambiente | 4 s / 2 s | 1-01 | `Empty hospital corridor at night: ceiling lights switching on one by one with soft relay clicks and a warm electrical hum, quiet distant ventilation, calm, no alarms, no voices. Length: 4 seconds` |
| `1-a-relogio` | Ambiente | 10 s / conforme o plano | 1-02a (baixo), 1-04, 1-10b, 1-10c | `Close-up ticking of an old mechanical wristwatch, one tick per second, steady, very intimate and dry, no music. Length: 10 seconds` |
| `1-a-aula` | Ambiente | 4 s / 2 s | 1-02b | `Crowded classroom ambience, many students settling, indistinct low murmur, chairs scraping, pages turning, no intelligible words. Length: 4 seconds` |
| `1-a-bar` | Ambiente | 4 s / 2 s | 1-03a | `Crowded bar at night watching a television, tense indistinct murmur of many people, glasses clinking, muffled TV broadcast tone with no intelligible words, anticipation. Length: 4 seconds` |
| `1-a-confete` | Ambiente | 4 s / 2 s | 1-03b; camada de 1-08a–c | `Confetti cannon pop followed by a crowd erupting in joyful cheering and applause indoors, indistinct shouts, no intelligible words. Length: 4 seconds` |
| `1-a-alerta` | Efeito | 2 s / 0,5 s, repetido | 1-04 | `Soft digital warning beep from a computer interface, single short tone, clean, slightly ominous, then silence. Length: 2 seconds` |
| `1-a-turbinas` | Ambiente | 4 s / 2 s | 1-05a | `Large wind turbines turning slowly at dawn, deep rhythmic blade whoosh, gentle wind, a few distant birds, open landscape, peaceful. Length: 4 seconds` |
| `1-a-portao` | Efeito | 4 s / 2 s | 1-05b | `Heavy metal factory gate rolling shut on old rails, grinding metal, ending in a loud final clang, empty industrial yard, light wind. Length: 4 seconds` |
| `1-a-protesto` | Ambiente | 4 s / 2 s | 1-06 (por baixo de `c-chuva`, filtrado) | `Peaceful protest crowd in the rain heard from inside a building through a closed window, rhythmic hand clapping and indistinct chanting, muffled, no intelligible words. Length: 4 seconds` |
| `1-a-praca` | Ambiente | 8 s / 5 s | 1-07, 1-08a–c | `Huge outdoor crowd at a night rally in a city square, roaring applause and indistinct cheering, wide and open, echo off buildings, no intelligible words. Length: 8 seconds` |
| `1-a-tremor` | Efeito | 4 s / 2 s por plano | 1-09, 1-10b, 1-10c | `Very subtle foley of a trembling elderly hand resting on a computer mouse on a wooden desk, tiny plastic rattle and fabric rustle, close and quiet. Length: 4 seconds` |

Total: 9 peças comuns + 17 do trailer 1.

## Mixagem e montagem

Feita no DaVinci Resolve (Fairlight), linha do tempo em 48 kHz (o Stable Audio gera em 44,1 kHz),
com a **grade de 120 BPM marcada a partir de 0,0 s**. Conferir o BPM do leito gerado e, se precisar,
ajustar o tempo antes de alinhar o primeiro tempo forte a 6,0 s.

**Níveis relativos** (música × ambiente; 0 dB = o mais alto do trecho):

| Trecho | Música | Ambiente | Observação |
|---|---|---|---|
| a1–a3 | — (`c-swell` a −6 dB) | 0 dB | Só ambiente; o *swell* sobe por baixo. |
| 1-01 – 1-02b | 0 dB | −10 dB | Piano em primeiro plano. |
| 1-03a – 1-03b | 0 dB | −4 dB | Bar e confete quase no nível da música. |
| 1-04 | leito −18 dB, piano 0 dB | −6 dB | Bipe de alerta acima do piano. |
| 1-05a, 1-06 | 0 dB | −8 dB | Protesto filtrado (passa-baixa, "atrás do vidro"). |
| 1-05b | −18 dB (só `1-m-celo`) | 0 dB | O portão domina. |
| 1-07 – 1-08c | 0 dB | −3 dB | Multidão e confete crescendo a cada corte. |
| 1-09 | 0 dB | −20 dB | Clímax: a música toma tudo. |
| 1-10a – 1-10c | — | 0 dB | Só ambiente. |
| e1a–e1b | `c-hit-final` 0 dB | caneta −3 dB | — |

**Cortes secos** (sem *fade*, sem cauda de reverb; cortar o envio de reverb junto):

- **20,0 s:** o leito fica mudo de 20,0 a 22,0 s e volta no ponto em que estaria.
- **31,0 s:** toda a música corta no mesmo quadro. É o impacto principal do trailer.
- **37,0 s:** **todo** o som corta, inclusive a chuva, junto com o corte para preto. Meio segundo
  de silêncio antes da caneta.

**Envelhecimento do motivo** (sempre o mesmo arquivo `1-m-piano`; nos planos de 2 s, só as 2 primeiras notas, Ré–Lá):

| Onde | Processamento |
|---|---|
| 1-01 – 1-02a | As 4 notas (4 s), limpo, sobre o leito (se o leito já tiver um piano que funcione, ele pode substituir). |
| 1-04 | Ré–Lá (2 s), desafinado −30 cents, menos agudos. |
| 1-09 | Ré–Lá (2 s), afinação −20 cents, *wow/flutter* de fita, passa-baixa leve: um piano velho no meio da orquestra. |

**Montagem 1-08:** um `1-hit-montagem` em cada corte (26, 27, 28 e 29 s), cada um 2 dB acima do
anterior. `1-a-praca` e `1-a-confete` também sobem a cada corte e abrem no estéreo.

**Eco da caneta:** e1a usa o **mesmo arquivo** `c-caneta` de a1, no mesmo nível e sem efeito, de
37,5 a 39,5 s. O primeiro e o último som do trailer são iguais, como o primeiro e o último frame.

## Pontos em aberto

- **Motivo:** o Stable Audio não aceita notas exatas. Se `1-m-piano` não sair reconhecível, tocar as
  4 notas num piano virtual e usar essa gravação.
- **Frame final:** `cartelas/final-{lang}.png` ainda não existe.
