# Trailer 4: "Reconstrução" — roteiro da trilha sonora

Trilha e som do trailer 4. Ordem e duração em [`4-reconstrucao.manifest.json`](4-reconstrucao.manifest.json)
e [`comum.manifest.json`](comum.manifest.json); narrativa em [4-reconstrucao.md](4-reconstrucao.md).
Mesmas regras e decisões globais da [trilha do trailer 1](1-mandato.trilha.md) (120 BPM, 4/4, um
compasso = um clipe; paleta; Stable Audio 3.0 Medium; sem voz), salvo o que muda abaixo.

## Intenção

O trailer 1 nunca resolve: sobe em Ré menor e corta no silêncio. Este faz o caminho que o 1 não fez.
Começa **sem música** na crise (só chuva e um violoncelo), o motivo **Ré – Lá – Sol – Fá** entra no
primeiro clique, a orquestra cresce a cada recuperação e, quando o sol entra no gabinete (4-11),
**passa para Ré maior**. O clímax (4-15) é o acorde que o trailer 1 negou. No fecho, a orquestra se
desfaz e sobra o piano com o motivo **corrigido, resolvendo na tônica**, sobre pássaros e vento pela
janela aberta, no lugar da chuva. O `c-hit-final`, grave e atonal, logo depois da resolução, é a
única sombra, junto com a tagline.

## Linha do tempo

| Ato | Tempo | Planos | O que a trilha faz | Int. |
|---|---|---|---|---|
| Abertura | 0–6 s | a1–a3 | Igual ao trailer 1 (peças comuns). | 1 → 3 |
| Crise | 6–12 s | 4-01 – 4-03 | Sem leito. `1-m-celo` grave e baixo, em loop; fluorescente, chuva, alerta. | 2 |
| Primeiro clique | 12–18 s | 4-04 – 4-06 | `1-m-leito` (trailer 1) começa; `1-m-piano` limpo: Ré–Lá (4-04), Sol–Fá (4-05); cordas em 4-06. | 3 → 4 |
| Reconstrução | 18–28 s | 4-07 – 4-10b | A chuva some em 18,0 s. Ostinato e pulso do `1-m-leito`; `1-riser` em 4-10a; `1-hit-vitoria` no confete (26 s). | 5 → 7 |
| Nação modelo | 28–37 s | 4-11 – 4-14c | **Ré maior** em 28,0 s, com o sol: entra `4-m-leito-maior`. Metais e tambores; um `1-hit-montagem` por corte (34, 35, 36 s). | 8 → 9 |
| Clímax | 37–39 s | 4-15 | Acorde de Ré maior, cheio, **resolvido**. | 10 |
| Fecho | 39–43 s | 4-16a – 4-16b | Orquestra se desfaz; `4-m-piano-final` resolve na tônica; pássaros e vento. Tudo some em 43,0 s. | 4 → 1 |
| Encerramento | 43–48 s | e1a–e1b | Igual ao trailer 1: silêncio, caneta (43,5 s), `c-hit-final` em 46,0 s. | 0 → 4 |

**Grade:** como no trailer 1, a montagem de 1 s (34–37 s) desloca os cortes para o tempo 3 (37, 39,
41, 43 s); o frame final (46,0 s, compasso 24) volta ao tempo 1.

**Por que dois leitos.** O Stable Audio não segue modulação nem marcação de tempo, e um leito em Ré
maior bateria com o motivo em Ré menor (Fá natural) de 12–16 s. Por isso a mudança de tom é feita
na edição: de 12 a 28 s entra o `1-m-leito` **s43** do trailer 1, do segundo 0 ao 16 (o arco já
cai na grade: piano em 12 s, cordas em 16 s, pulso em 18 s). Em 28,0 s, coberto pela cauda do
`1-hit-vitoria` e junto com o sol, entra o `4-m-leito-maior`.

## Peças

**Reaproveitadas, sem gerar de novo (23):** as 9 comuns (`c-*`) e, do trailer 1, `1-m-leito`
(0–16 s), `1-m-piano` (sempre limpo, nunca envelhecido), `1-m-celo` (em loop, 6 s), `1-riser`,
`1-hit-vitoria`, `1-hit-montagem`, `1-a-hospital`, `1-a-relogio`, `1-a-aula`, `1-a-bar`,
`1-a-confete`, `1-a-alerta`, `1-a-turbinas` e `1-a-portao` (só o rolar do portão, sem a batida
final, em 4-08).

**Novas (9)**, prompts no formato do trailer 1:

| Peça | Tipo | Gerar / usar | Onde entra | Prompt |
|---|---|---|---|---|
| `4-m-leito-maior` | Música | 20 s / 15 s (28–43), várias seeds | 4-11 – 4-16b | `Cinematic orchestral trailer score that opens on a bright sustained D major string chord and blooms: warm strings, french horns, low brass and big drums rising into a triumphant, fully resolved major climax chord, then gently falls away to quiet sustained strings. Uplifting, warm, no choir, no vocals. Key: D major. BPM: 120. Length: 20 seconds` |
| `4-m-piano-final` | Música | piano virtual / 4 s | 4-16a – 4-16b | **Tocado num piano virtual**, não gerado: Ré (39 s) – Lá (40 s) – Sol (41 s) – **Fá♯** (41,5 s) – **Ré** (42 s, sustentado até sumir em 43 s). É o motivo do trailer 1 "corrigido". Plano B no Stable Audio: `Solo felt piano playing a slow motif, rising then descending and resolving softly on the tonic, warm and peaceful, soft room, no other instruments. Key: D major. BPM: 120, half-time feel. Length: 6 seconds` |
| `4-a-mercado` | Ambiente | 4 s / 2 s | 4-01 | `Empty supermarket at night: buzzing and flickering fluorescent tube, faint electrical crackle, hollow silence, no music, no voices. Length: 4 seconds` |
| `4-a-fila` | Ambiente | 4 s / 2 s | 4-02 | `Heavy rain falling on many umbrellas in front of a closed factory gate, a long quiet waiting line, shuffling feet on wet pavement, no intelligible words. Length: 4 seconds` |
| `4-a-padaria` | Ambiente | 4 s / 2 s | 4-07 | `Busy supermarket bakery aisle in the early morning, bread loaves placed on shelves, paper rustle, soft indistinct chatter of shoppers, no intelligible words. Length: 4 seconds` |
| `4-a-praca-dia` | Ambiente | 6 s / 2–3 s | 4-12, 4-14a | `Sunny city square in the daytime: children laughing and running, an open-air market, birds, warm and lively, no music, no intelligible words. Length: 6 seconds` |
| `4-a-cidade` | Ambiente | 4 s / 2 s | 4-13, 4-15 | `Aerial ambience over a peaceful green city in daylight: soft wind, distant calm traffic, river water, birds, open and airy, no music. Length: 4 seconds` |
| `4-a-rio` | Efeito | 2 s / 1 s | 4-14c | `Young people jumping into a river on a sunny day: splash and joyful indistinct shouts, no intelligible words. Length: 2 seconds` |
| `4-a-janela` | Ambiente | 10 s / 6 s | 4-11, 4-16a–b | `Quiet office in the morning with an open window: birdsong, a gentle breeze moving a curtain, distant calm city, no music, no voices. Length: 10 seconds` |

Na montagem, 4-14b usa `1-a-hospital` baixo, sem os estalos de relé.

## Mixagem: o que muda em relação ao trailer 1

- **Chuva:** `c-chuva` de 2 a 18 s, sumindo em *fade* de 1 s até 18,0 s. Depois, não volta: em
  4-11 e no fecho entra `4-a-janela`.
- **Emenda em 28,0 s:** `1-m-leito` sai em *fade* de 0,5 s sob a cauda do `1-hit-vitoria`;
  `4-m-leito-maior` entra no tempo 1. Conferir o BPM das duas peças antes de alinhar.
- **Sem cortes secos** na música, ao contrário do trailer 1. A única queda é o fim do fecho: tudo
  some até 43,0 s, e o encerramento segue igual (meio segundo de silêncio, caneta, *hit* final).
- **Motivo:** `1-m-piano` limpo em 12–16 s (as 4 notas); `4-m-piano-final` em 39–43 s, a 0 dB sobre
  o leito a −12 dB.
- **Montagem 4-14:** um `1-hit-montagem` em 34, 35 e 36 s, cada um 2 dB acima do anterior, e o 4º
  em 37,0 s junto com o clímax.
