# Trailer 4: "Reconstrução" — roteiro da trilha sonora

Trilha e som do trailer 4. Ordem e duração em [`4-reconstrucao.manifest.json`](4-reconstrucao.manifest.json)
e [`comum.manifest.json`](comum.manifest.json); narrativa em [4-reconstrucao.md](4-reconstrucao.md).
Mesmas regras da [trilha do trailer 1](1-mandato.trilha.md) (paleta, Stable Audio 3.0 Medium, sem
voz), salvo o andamento e o que muda abaixo.

## Intenção

O trailer 1 nunca resolve: sobe em Ré menor e corta no silêncio. Este faz o caminho que o 1 não
fez. A herança é **sem música**: só chuva, um violoncelo e, no mercado, o zumbido de uma lâmpada
que morre. O silêncio total vem antes do clique. **A música nasce do som das luzes do hospital** e
cresce com a reconstrução. Quando a cortina se abre, passa a **Ré maior**, e o vale é o acorde que
o trailer 1 negou. No fecho, o motivo do trailer 1 é tocado **corrigido, resolvendo na tônica**. O
`c-hit-final`, grave e atonal, logo depois da resolução, é a única sombra, junto com a tagline.

## Decisões globais

| Item | Decisão |
|---|---|
| Andamento | **80 BPM**, 4/4. Um compasso = 3 s = **um plano**. A abertura (6 s) ocupa 2 compassos; todo corte cai no tempo 1; o frame final, em 51,0 s, no compasso 18. A música lenta tira o metrônomo da montagem. |
| Fluidez | **Pontes de som:** o ambiente do plano seguinte entra 0,5 a 0,75 s antes do corte. **Crossfades de áudio de 1,5 s** sob os fades de imagem. |
| Impacto | **Nenhum *hit* por corte.** Só dois picos: o clique no silêncio (≈ 16,5 s) e o acorde do vale (39,0 s). Cortes secos de áudio só em 12,0 s, 15,0 s e 48,0 s. |
| Motivo | Ré – Lá – Sol – Fá, como no trailer 1, **tocado num piano virtual** (o `1-m-piano` está a 120 BPM e não serve). |

## Linha do tempo

| Ato | Tempo | Planos | Trilha e som | Int. |
|---|---|---|---|---|
| Abertura | 0–6 s | a1–a3 | Comum. | 1 → 3 |
| Herança | 6–15 s | 4-01 – 4-03 | Sem leito; `1-m-celo` grave, em loop. A chuva de a2 continua sem corte do gabinete para a rua: é a ponte de 4-01 para 4-02. Em 12,0 s a chuva **corta seco**, e no mercado só se ouve `4-a-mercado`. A lâmpada morre por volta de 14,5 s, e daí até 15,0 s há **silêncio total**. | 2 → 1 |
| O clique | 15–21 s | 4-04 – 4-05 | Silêncio; clique (`c-mouse-clique`) por volta de 16,5 s, no tempo forte mais próximo do gesto. Em 18,0 s, os estalos de relé de `1-a-hospital` são realinhados a cada tempo (0,75 s). O motivo entra em 18,0 s, uma nota por tempo, sobre o `4-m-leito-menor`. | 1 → 4 |
| Reconstrução | 21–27 s | 4-06 – 4-07 | Cordas em 21 s; pulso e ostinato em 24 s. `4-a-mercado-dia` em 4-06. O rolar do portão (`1-a-portao`, sem a batida final) entra 0,75 s antes do corte para 4-07. | 4 → 6 |
| Sol | 27–39 s | 4-08 – 4-11 | Em 27,0 s, na cortina, entra o `4-m-leito-maior` em **Ré maior**. O arrasto da cortina (`4-a-cortina`) começa em 26,25 s, como ponte. Depois a praça (`4-a-praca-dia`), o rio (`4-a-rio`: o *splash* em câmera lenta, grave e com reverb) e o voo (`4-a-cidade`), cada ambiente entrando meio compasso antes do seu corte. | 7 → 9 |
| Clímax | 39–42 s | 4-12 | Acorde de Ré maior, cheio e resolvido, quando o sol aparece. Tímpano em rulo de 37,5 a 39,0 s, no lugar de *hit* seco. | 10 |
| Fecho | 42–48 s | 4-13 – 4-14 | A orquestra se desfaz sob o fade de sol. Piano: Ré (42,0), Lá (43,5), Sol (45,0), **Fá♯** (45,75), **Ré** (46,5, sustentado). O vento e os pássaros de `4-a-janela` ficam sozinhos até 48,0 s. | 4 → 1 |
| Encerramento | 48–53 s | e1a–e1b | Corte seco em 48,0 s; silêncio 0,5 s; caneta 48,5–50,5 s; `c-hit-final` em 51,0 s. | 0 → 4 |

## Peças

**Reaproveitadas (12):** as 9 comuns (`c-*`) e, do trailer 1, `1-m-celo` (em loop),
`1-a-hospital` (estalos realinhados) e `1-a-portao` (só o rolar, sem a batida final).

**Novas (10)**, prompts no formato do trailer 1:

| Peça | Tipo | Gerar / usar | Onde entra | Prompt |
|---|---|---|---|---|
| `4-m-leito-menor` | Música | 14 s / 9 s (18–27) | 4-05 – 4-07 | `Cinematic orchestral score, slow and emotional: sparse solo felt piano, then warm low strings enter, then a soft steady low drum pulse and a gentle string ostinato building hope, restrained, no climax. No choir, no vocals. Key: D minor. BPM: 80. Length: 14 seconds` |
| `4-m-leito-maior` | Música | 24 s / 18 s (27–45), várias seeds; alinhar o clímax em 39,0 s | 4-08 – 4-13 | `Cinematic orchestral trailer score that opens on a bright sustained D major string chord and grows in one continuous swell: soaring strings, french horns, low brass and big drums building into a triumphant, fully resolved major climax chord, then gently falls away to quiet sustained strings. Uplifting, warm, no choir, no vocals. Key: D major. BPM: 80. Length: 24 seconds` |
| `4-a-mercado` | Ambiente | 4 s / 3 s | 4-03 | `Empty supermarket at night: buzzing and flickering fluorescent tube, faint electrical crackle, hollow silence, no music, no voices. Length: 4 seconds` |
| `4-a-fila` | Ambiente | 4 s / 3 s | 4-02 | `Heavy rain falling on many umbrellas in front of a closed factory gate, a long quiet waiting line, shuffling feet on wet pavement, no intelligible words. Length: 4 seconds` |
| `4-a-mercado-dia` | Ambiente | 4 s / 3 s | 4-06 | `Supermarket in the early morning: soft warm hum, distant indistinct shoppers, a cart rolling, no music, no intelligible words. Length: 4 seconds` |
| `4-a-cortina` | Efeito | 3 s / 2 s | 4-08 (a partir de 26,25 s) | `A heavy fabric curtain pulled open quickly along a metal rail, a soft whoosh, followed by a burst of birdsong from an opening window, no music. Length: 3 seconds` |
| `4-a-praca-dia` | Ambiente | 6 s / 3 s | 4-09 | `Sunny city square in the daytime: children laughing and running, an open-air market, birds, warm and lively, no music, no intelligible words. Length: 6 seconds` |
| `4-a-rio` | Efeito | 4 s / 3 s | 4-10 | `Young people jumping into a river on a sunny day: splash and joyful indistinct shouts, no intelligible words. Length: 4 seconds` |
| `4-a-cidade` | Ambiente | 8 s / 6 s | 4-11, 4-12 | `Aerial ambience over a peaceful green city in daylight: soft wind, distant calm traffic, river water, birds, open and airy, no music. Length: 8 seconds` |
| `4-a-janela` | Ambiente | 10 s / 6 s | 4-13 – 4-14 | `Quiet office in the morning with an open window: birdsong, a gentle breeze moving a curtain, distant calm city, no music, no voices. Length: 10 seconds` |

O motivo (Ré–Lá–Sol–Fá em 18 s; Ré–Lá–Sol–Fá♯–Ré no fecho) é gravado num piano virtual, com
timbre de piano de feltro, e não sai do Stable Audio.

## Mixagem

- **Chuva:** `c-chuva` de 2 a 12 s, sem corte entre gabinete e rua; corte seco em 12,0 s.
- **Emenda em 27,0 s:** `4-m-leito-menor` sai em *fade* de 0,75 s sob o arrasto da cortina;
  `4-m-leito-maior` entra no tempo 1. Conferir o BPM das duas peças antes de alinhar.
- **Níveis:** a herança fica só no ambiente (`1-m-celo` a −14 dB); a partir de 18 s, música a
  0 dB e ambientes de −8 a −12 dB, menos o *splash* de 4-10 (−4 dB); fecho com o piano a 0 dB
  sobre o leito a −12 dB.
