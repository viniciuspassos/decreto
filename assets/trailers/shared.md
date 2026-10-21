# Decreto Trailers: Shared Foundation

Four **60-second maximum** horizontal (16:9) trailers, with no social media versions, generated in
ComfyUI (Wan 2.2 T2V A14B, 2-second clips; see [production](production.md)) and assembled in editing.
Shared tagline: **"Ninguém nasce tirano. Basta um decreto."** (final frame only)

## Storyboards

- [Trailer 1: "Mandato"](1-mandato.md)
- [Trailer 2: "Ordem e Futuro"](2-ordem-e-futuro.md)
- [Trailer 3: "Decreto"](3-decreto.md)
- [Trailer 4: "Reconstrução"](4-reconstrucao.md)

## Shared creative direction

- **Images only.** No dialogue, narration, or title cards. The only on-screen text is the **game UI** on
  the monitor and the **final frame**. The images, soundtrack, and ambient sound tell the story.
- **First-person, no face.** The player is represented by a pair of hands at a desk, facing a monitor.
  The game is that computer. The ruler’s face never appears (not in portraits, statues, or reflections;
  always turned away, backlit, or out of focus), so viewers can take the ruler’s place.
- **Rising power.** Three visual devices recur and escalate across the trailers:
  1. **The camera rises:** each act starts farther from the desk (desk → window → square → city → country).
  2. **The graph lights up:** each cut to the monitor shows more active nodes; the political capital bar fills.
  3. **The cuts get shorter:** 2 s → 1 s → 0.5 s through the climax, with the soundtrack building too. Exception:
     trailer 4 reverses this pattern (3-second shots joined by fades) for a fluid crescendo.
- **Game UI, flexible content.** The monitor is generated with only a glowing screen; the `apps/web` UI
  (`pnpm dev:mocked`) is composited onto it during editing. Wan cannot generate legible text, so screens
  and signs within the scenes (TVs, large displays, posters) must not contain readable text. The nodes,
  utopias, and text shown **do not need to exist in the game**: the trailer serves the story, not the
  `game-content` data.
- **One simple gesture per clip.** Each shot is one continuous action (no animated transitions within
  the clip—fills, emerging text, transforming shapes—or compound camera movement). Wan 2.2 handles one
  gesture well; any complex transition should be created in editing, with a cut between two keyframes.
- **No graphic violence (storyboard §S6).** Repression and death are shown through off-screen sound,
  shadows, objects, and people’s reactions—never blood, injuries, or bodies.
- **Same beginning, same ending.** The opening (A1–A3) and ending (e1a–e1b) are identical in every
  trailer: the first and last frames are the same. They are generated only once.
- **Time budget.** 6 s opening + middle + 5 s ending, up to **60 s** total. Each clip stays on screen for
  2 s. Trailer 1 is 42 s (31-second middle).

The **Interface** column describes only what appears in the game UI on the monitor. "—" means the
shot has no monitor.

### Shared opening (0–6 s)

| # | Time | Shot (AI) | Interface |
|---|---|---|---|
| A1 | 2 s | Preto. Som de caneta assinando papel. | — |
| A2 | 2 s | 1ª pessoa: mãos pousam numa mesa de madeira vazia, gabinete escuro, chuva na janela. Um monitor antigo acende e ilumina as mãos. | Tela inicial do jogo: **DECRETO** |
| A3 | 2 s | Close no monitor; o cursor para sobre o primeiro nó. | Grafo de nós todo cinza |

### Shared ending (final 5 s)

| # | Time | Shot | Screen |
|---|---|---|---|
| e1a | 3 s | Preto. Som de caneta assinando papel (eco de A1). | — |
| e1b | 2 s | **Frame final**, igual em todos (`cartelas/final-{lang}.png`), com um *hit* grave. | *"Ninguém nasce tirano. Basta um decreto."* + **DECRETO** |

## Production

See **[production.md](production.md)** for the workflow, models, prompt guidelines, generation script, and monitoring.

**When creating or editing a storyboard,** follow the
[storyboard and manifest structure](production.md#storyboard-and-manifest-for-each-trailer):
- Each trailer has a `.md` (narrative) and a `.manifest.json` (ordered shots with prompts).
- The opening and ending are defined in `shared.manifest.json`.
- Storyboard table rows and manifest shots use the same `id`.
- A generated clip is displayed for no more than 3 seconds.
- The full trailer is no longer than 60 seconds.

1. **Clips** are generated in batches through the CLI (`pnpm generate:trailer-clips`) with Wan 2.2
   T2V A14B (text-to-video), at 832×480, 2 seconds each, about 15 minutes per clip.
2. **Post-production** with ffmpeg: 24 fps and 1080p. Each clip is displayed for 2 seconds, without slow
   motion. Longer shots are split into 2 or 3 clips joined by cuts.
3. **Editing:** composite a game screen recording onto the monitor (pt-BR and en UI versions), add the
   final frame in both languages, soundtrack, and sound (Wan does not generate audio).
