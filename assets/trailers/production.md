# Decreto Trailers: Clip Production

Reference for generating trailer video clips ([storyboards](shared.md)) in local ComfyUI. It explains
**which model to use and why**, **how to write prompts**, **how to run batches through the CLI**, and
**how to monitor jobs in the ComfyUI UI**, without Claude or Codex during generation.

## Summary

| Item | Decision |
|---|---|
| Machine | Mac M4 Pro, 24 GB unified memory, ComfyUI Desktop (MPS) |
| Model | **Wan 2.2 T2V A14B in GGUF Q4_K_M** + 4-step lightx2v LoRA (text-to-video) |
| Clip | **2 s**: 33 frames, 832×480, 16 fps |
| Time | **~14–15 min per clip**, or ~4 clips per hour |
| Post-production | ffmpeg: interpolate to 24 fps and upscale to 1080p; apply 1.5× slow motion (2 s becomes 3 s) only for clips displayed for 3 s |
| Editing | Video editor (DaVinci Resolve) or ffmpeg |
| Storyboard | One `.md` (narrative) and one `.manifest.json` (shots and prompts) per trailer: see [Storyboard and manifest](#storyboard-and-manifest-for-each-trailer) |
| Generation | `pnpm generate:trailer-clips`, run through the CLI overnight |
| Monitoring | ComfyUI queue panel and terminal output |

## Why this model and format

Tests run on this machine on 2026-10-18:

| Model | Result |
|---|---|
| Wan 2.2 TI2V 5B | ❌ Produces only noise on MPS, in both fp16 and bf16. This is a known ComfyUI bug (issue #16644, still open). Removed. |
| Wan 2.1 T2V 1.3B | ❌ Produces a corrupted image after 5 seconds and takes 1 h 54 min. Works only with 1 frame. |
| **Wan 2.2 T2V A14B GGUF Q4_K_M + lightx2v** | ✅ **Quality is excellent and stable at 2 seconds.** It follows simple prompt actions, such as a screen turning on. |

**The limitation is video length, not the model.** On this Mac, ComfyUI attention works only up to
about 14,000 tokens per clip. At 832×480, that is 33 frames. All three attention algorithms were
tested:

| Attention | Result |
|---|---|
| Sub-quadratic (MPS default) | ✅ Works up to ~14,000 tokens. Above that, output is corrupted and generation is very slow. |
| `--use-pytorch-cross-attention` | ❌ Builds the full matrix and tries to allocate ~80 GB |
| `--use-split-cross-attention` | ❌ Miscalculates available Mac memory and tries to allocate 61 GB |

For this reason:
- **Do not increase `length` or resolution** in `_base.api.json`. At 49 or 81 frames, the output is
  corrupted.
- **Do not add attention flags** to `launchArgs` in
  `~/Library/Application Support/Comfy Desktop/installations.json`. The value must remain just
  `"--enable-manager"`. Edit this file only when the app is fully quit with ⌘Q.
- **Splitting the high- and low-noise phases into separate jobs does not make generation faster.** This
  was tested: swap drops from 17 GB to ~3 GB, but time per step stays the same. The bottleneck is GPU
  computation, not memory. Swap remains high (~17 GB) during batch runs. This is expected, which is why
  batches run overnight.

If higher quality or longer clips are needed in the future, options include renting a cloud GPU,
where the same workflows run at 720p and 5 seconds, or using a paid API only for the most important shots.

## Installation

Directories: models in `~/ComfyUI-Shared/models/`; ComfyUI outputs in `~/ComfyUI-Shared/output/`.

| File | Directory | Source |
|---|---|---|
| `Wan2.2-T2V-A14B-HighNoise-Q4_K_M.gguf` (~9.6 GB) | `diffusion_models/` | [QuantStack/Wan2.2-T2V-A14B-GGUF](https://huggingface.co/QuantStack/Wan2.2-T2V-A14B-GGUF), `HighNoise/` directory |
| `Wan2.2-T2V-A14B-LowNoise-Q4_K_M.gguf` (~9.6 GB) | `diffusion_models/` | same repository, directory `LowNoise/` |
| `wan2.2_t2v_lightx2v_4steps_lora_v1.1_high_noise.safetensors` | `loras/` | [Comfy-Org/Wan_2.2_ComfyUI_Repackaged](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged), `split_files/loras/` |
| `wan2.2_t2v_lightx2v_4steps_lora_v1.1_low_noise.safetensors` | `loras/` | same repository |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `text_encoders/` | same repository, `split_files/text_encoders/` |
| `wan_2.1_vae.safetensors` | `vae/` | same repository, `split_files/vae/` |

Third-party node: **ComfyUI-GGUF** (city96), which provides the `UnetLoaderGGUF` node. Install it
through ComfyUI-Manager. Restart the app after installing models or nodes.

## Pipeline (`_base.api.json`)

The template is [`_base.api.json`](_base.api.json), in ComfyUI API format. For each clip, the script
clones the template and fills in the prompt (node `2`), seed (node `5`), and filename (node `7`).
Everything else is fixed:

- Two `UnetLoaderGGUF` nodes (high noise and low noise), each with its own lightx2v LoRA (strength 1.0)
  and `ModelSamplingSD3` with shift 5;
- Two `KSamplerAdvanced` nodes with 4 steps total, cfg 1, euler/simple:
  - High noise on steps 0–2, returning the remaining noise;
  - Low noise on steps 2–end, without adding noise;
- `EmptyHunyuanLatentVideo` at 832×480 with 33 frames, `VAEDecode` with the Wan 2.1 VAE, and
  `CreateVideo` at 16 fps;
- **Fixed negative prompt**: the Wan default plus logos, brands, text, watermarks, national flags, and
  graphic violence (blood, injuries, bodies), according to storyboard §S6.

Do not edit the prompt in `_base.api.json`; the script fills it in every time.

## Writing prompts

Guidelines from testing:

- **Write in English.** Describe one scene and **a single continuous gesture** per clip. Transitions happen
  in the edit, as a cut between two clips.
- **Specify the framing explicitly:** where the camera looks from, what is in the foreground, and what
  does *not* appear. Example: *"The palace itself is not visible, only the balustrade in the
  foreground"*. Without this, the model chooses the framing and often gets it wrong.
- **First-person, no face:** start with *"First-person point of view."* and describe only the hands.
  Even so, in wide shots the model tends to show the ruler from behind. Check the result.
- **No flags.** The model turns "crowd with flags" into real national flags, even with the negative
  prompt. Use *"raised hands"*, *"phone lights"*, *"torches"*, or *"plain single-color banners"*, and
  check the result.
- **No brands or logos.** Request generic objects: *"old beige CRT computer monitor"*, not a brand name.
- **Screens should only glow.** Wan cannot generate legible text. Ask for *"screen switches on and glows
  bright cold blue-white"*; overlay the game interface in the edit.
- **No graphic violence (storyboard §S6).** Convey consequences through shadows, objects, and reactions.
- End with the shared style: *"Cinematic, shallow depth of field, slow push-in, moody low-key
  lighting, film grain."*

## Storyboard and manifest for each trailer

Each trailer has **two files**, with a one-to-one correspondence between shots:

| File | Audience | Content |
|---|---|---|
| `<n>-<slug>.md` (e.g. `1-mandato.md`) | People | The narrative: what each shot shows, its duration, and the interface on the monitor. **No prompts.** |
| `<n>-<slug>.manifest.json` (e.g. `1-mandato.manifest.json`) | Script | The **ordered** shot list with each clip prompt. It defines the trailer’s **rough cut**: visuals and pacing. |

The shared opening and ending are documented in `shared.md` and **`shared.manifest.json`**. Trailer
manifests reference them, so these shots are generated only once.

Anything **not** in the manifest is handled in the video editor: the game recording composited **inside
the monitor** in a clip (described in the storyboard’s `Interface` column), soundtrack, and sound.

Full example: [`_exemplo.manifest.json`](_exemplo.manifest.json). Files beginning with `_` are templates and are never read as trailers.

> **The current storyboards are still in the old format,** including the opening and ending in
> `shared.md`. They use IDs such as `A1` and `1.10 (a)`, have no `Type` column, and include 4–8-second
> clips. Migrate everything to the rules below when rewriting them.

### Manifest format

```json
{
  "trailer": "1-mandato",
  "plans": [
    { "id": "a1", "shared": true },
    { "id": "1-01", "kind": "clip", "prompt": "First-person point of view. ...", "seed": 42 },
    { "id": "1-02", "kind": "clip", "prompt": "", "transition": "fade" },
    { "id": "1-03", "kind": "screen", "file": "gravacoes/1-03.mov", "seconds": 3 },
    { "id": "e1a", "shared": true },
    { "id": "e1b", "shared": true }
  ]
}
```

- `trailer`: same as the storyboard filename without `.md` (for example, `1-mandato`). In
  `shared.manifest.json`, use `shared`.
- `plans`: shots **in the order they appear in the trailer**. Each shot has:

| Field | Required | Description |
|---|---|---|
| `id` | yes | Same value as the storyboard’s `#` column. Use only lowercase letters, numbers, and hyphens: `a1`–`a3`, `e1a`, and `e1b` for shared shots; `<n>-<nn>` for trailer-specific shots, where `<n>` is the trailer number (`1-01`, `2-07`). For a shot split into multiple clips, append a letter (`1-10a`, `1-10b`). |
| `shared` | — | `true` to use the shot with the same `id` from `shared.manifest.json`. No other fields are used in that case. |
| `kind` | yes, unless `shared` | `clip`: generated by Wan. `screen`: game screen recording. `image`: still image, such as the final frame. `black`: black screen. |
| `prompt` | yes, for `clip` | The prompt in English (see [Writing prompts](#writing-prompts)). It **may be `""`** while unwritten; the shot remains pending. |
| `seed` | — | For `clip`. Defaults to 42. Change it to try another generation of the same shot: each seed produces its own file (see [Clip locations](#clip-locations)), so previous attempts are kept. |
| `file` | yes, for `screen` and `image` | File path relative to `assets/trailers/` (for example, `gravacoes/1-03.mov`). For files with language variants, use `{lang}` in the path (for example, `cartelas/final-{lang}.png`); each manifest generates a video in `pt-BR` and another in `en`. |
| `seconds` | yes, for `black`, `screen`, and `image` | On-screen duration. Optional for `clip`: defaults to 3 s, the clip duration after slow motion; a shorter value trims the end (for example, `1` in a fast montage). With `2`, the clip plays **without slow motion**: the full generated 2 seconds, only interpolated to 24 fps so the gesture is not cut off. **Never exceed 3 for `clip`.** |
| `transition` | — | How this shot **enters**: `cut` (default, hard cut) or `fade` (0.5 s crossfade within this shot’s duration, without shortening the total). |

### Storyboard writing rules

The script assembles the trailer from the manifest. Keep the storyboard and manifest aligned:

1. **Each storyboard table row is a manifest entry**, in the same order and with the same `id` in the
   `#` column. Do not use free-form numbering such as "1.10 (a)".
2. **A clip lasts at most 3 s on screen.** The generated 2 seconds become 3 s with slow motion, or
   remain 2 s without it (`seconds: 2`). Split a longer shot into multiple rows (`1-10a`, `1-10b`), each
   with a single gesture.
3. **The `Time` column is the on-screen duration** (`seconds`, or 3 s for a `clip` without `seconds`).
   The full trailer, including the shared opening and ending, is **at most 60 s** (trailer 1 is 42 s).
4. **Each row specifies a type** (`clip`, `screen`, `image`, or `black`). This makes clear what Wan
   generates, what is recorded from the game, and what is a still image.
5. **Prompts belong only in the manifest.** The storyboard describes the scene in Portuguese for people.

Storyboard table format:

```markdown
| # | Type | Time | Shot | Interface |
|---|---|---|---|---|
| 1-01 | clip | 3 s | Clique. Luzes de um corredor de hospital se acendem. | Nó **Ampliação da rede pública** acende |
| 1-02 | screen | 3 s | Gravação do grafo com o nó acendendo. | Grafo com 3 nós ativos |
```

### Supporting files

- `gravacoes/`: game screen recordings (`pnpm dev:mocked`).
- `cartelas/`: still images. Currently this contains only the final frame, the sole exception to the
  "no title cards" rule in `shared.md`. The ending (black screen with pen sound, then final frame) uses
  two rows: one `black` and one `image`.

### Clip locations

Each generated `clip` is saved to `clips/<trailer>/<id>-s<seed>.mp4`; shots from `shared.manifest.json`
go in `clips/shared/`. The file’s existence marks it as "already generated." Changing the `seed` creates
a new file, and the edit always uses the file matching the manifest’s current `seed`.

## Generate clips through the CLI

The command runs in your terminal and communicates directly with ComfyUI. **It does not use Claude or
Codex**; no model tokens are consumed during generation. Use an agent only to write prompts and review
results.

### 1. Generate a trailer’s clips from its manifest

```sh
pnpm generate:trailer-clips --trailer assets/trailers/1-mandato.manifest.json
```

The script reads `<trailer>.manifest.json`, resolves `shared: true` shots from
`shared.manifest.json` (next to the trailer manifest; pass another path with
`--shared-manifest`), and generates only `kind: "clip"` shots with a non-empty prompt. Pending shots
(`prompt: ""`) and `screen`/`image`/`black` types (outside Wan’s scope) are skipped without error.
A `shared` shot with no matching entry in `shared.manifest.json` stops the batch with an error.

### 2. Test a shot before the batch

Each generated clip is saved as `assets/trailers/clips/<trailer>/<id>-s<seed>.mp4` (shared shots go to
`clips/shared/<id>-s<seed>.mp4`). Pass this name to `--only`:

```sh
pnpm generate:trailer-clips --trailer assets/trailers/1-mandato.manifest.json --only 1-01-s42
```

Generation takes ~15 min. Open the resulting `.mp4` and adjust the manifest prompt if needed.

### 3. Run the batch (overnight)

```sh
mkdir -p assets/trailers/clips
caffeinate -i pnpm generate:trailer-clips --trailer assets/trailers/1-mandato.manifest.json 2>&1 | tee -a assets/trailers/clips/lote.log
```

- `caffeinate -i` keeps the Mac awake during the batch.
- The terminal prints one timestamped line for each completed clip. `tee` saves those lines to
  `lote.log`.
- **Already generated clips are skipped.** If the batch stops (error, Mac restart, app closed), rerun
  the same command to resume where it stopped. To regenerate a clip, delete its `.mp4` or use
  `--force --only <id>-s<seed>`.
- **An error stops the batch** as soon as ComfyUI reports it, with ComfyUI’s error message. Fix the
  entry and run again.
- Estimate ~15 min per entry. A batch of 20 entries takes about 5 hours.
- **Do not use ComfyUI for anything else during the batch.** The 60-minute per-clip timeout includes
  queue time. A manual UI job delays the current clip and can exceed that limit.
- Other options: `--force` regenerates all clips; `--comfy-url` (or the `COMFYUI_URL` environment
  variable) points to another ComfyUI instance.

Clips are saved under `assets/trailers/clips/`, which is in `.gitignore` (raw output). A copy is also
saved under `~/ComfyUI-Shared/output/decreto/<category>/`.

`clips.json` remains available as a standalone workbench for testing a one-off prompt outside a trailer
sequence. Without `--trailer`, `pnpm generate:trailer-clips` reads `clips.json` again.

## Monitor jobs in the ComfyUI UI

The batch runs through the API, so **the workflow is not open on the canvas** and the KSampler node’s
progress bar is not shown. To monitor it:

1. **Queue panel:** in ComfyUI Desktop’s left sidebar, open **Queue** (sometimes called *Jobs* or
   *History*). The running job appears at the top with a progress bar. Upcoming clips do not appear as
   pending because the script submits one clip at a time, after the previous one finishes.
2. **Window title:** while a job runs, it shows its percentage, such as `[47%] ComfyUI`.
3. **Preview:** completed clips appear in the same panel’s history. Click one to watch it or load its
   workflow on the canvas.

The ComfyUI log (`~/ComfyUI-Installs/comfyui/ComfyUI/user/comfyui.log`) records sampling progress
only when sampling finishes, so it cannot be used for live monitoring.

**Expected time per clip:** ~6 min for the high-noise phase (2 steps of ~3 min), ~6 min for low noise,
and ~1.5 min to decode. If the first step takes over 10 min or the video is corrupted, check that
`launchArgs` contains only `"--enable-manager"`.

## Post-production with ffmpeg

Install with `brew install ffmpeg`. To process each clip (interpolate to 24 fps, apply 1.5× slow motion,
and upscale to 1080p):

```sh
ffmpeg -i input.mp4 -vf "setpts=1.5*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=1920:1080:flags=lanczos,format=yuv420p" -c:v libx264 -crf 16 -preset slow output.mp4
```

For a clip displayed for 2 s (`seconds: 2`, as in trailer 1), use the same command without
`setpts=1.5*PTS,`.

To join two processed clips with a 0.5 s crossfade (`offset` is the first clip duration minus 0.5):

```sh
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=2.59[v]" -map "[v]" -c:v libx264 -crf 16 output.mp4
```

Create the final edit in a video editor such as DaVinci Resolve, compositing the game screen recording
on the monitor and adding the final frame, soundtrack, and sound. Wan does not generate audio.

**Storyboard durations:** each generated clip is shown for 2 s, or 3 s with slow motion. Longer shots in
the storyboard are split into 2 or 3 clips joined by cuts.
