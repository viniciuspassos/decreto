# Prompts de geração de imagem

Workflows do ComfyUI (formato API) que geram as imagens de `assets/images/`. Cada arquivo em
`prompts/<categoria>/<nome>.json` gera `images/<categoria>/<nome>.png` — mesmo caminho, mesmo nome.

As imagens aparecem após eventos marcantes (roteiro §8). Tom de "simulação séria": repressão
aparece de forma sóbria, sem violência gráfica, sangue ou ferimentos (roteiro §6) — o negative
prompt de cada workflow já bloqueia isso; mantenha ao criar novos.

## Modelo

- **Checkpoint:** `RealVisXL_V5.0_Lightning_fp16.safetensors` (SDXL destilado, ~6,9 GB)
  — https://huggingface.co/SG161222/RealVisXL_V5.0_Lightning
- Colocar em `models/checkpoints/` do ComfyUI. Não precisa de VAE, LoRA nem nós customizados.

## Parâmetros (padrão de todos os workflows)

| Parâmetro | Valor |
|---|---|
| Resolução | 1088×1024 (proporção do quadro da tela de evento) |
| Passos | 6 |
| CFG | 1,5 |
| Sampler / scheduler | `dpmpp_sde` / `karras` |

## Como rodar

Com o ComfyUI aberto em `127.0.0.1:8188`:

```bash
comfy run --workflow assets/prompts/eventos/prisao-oposicao.json
```

Ou arraste o `.json` para a interface do ComfyUI. A saída vai para
`output/decreto/<categoria>/<nome>_00001_.png`; copie para `assets/images/<categoria>/<nome>.png`.

Para variações, troque `seed` no nó `KSampler` (ou `batch_size` em `EmptyLatentImage` para gerar
várias de uma vez e escolher a melhor).

## Máquina

- **M2 16 GB** (onde foram gerados): ~2 min por imagem, ~3,5 min na primeira (carregar o modelo).
  Z-Image Turbo bf16 **não roda** — precisa de ~19,4 GB (modelo 11,7 GB + text encoder 7,7 GB).
- **M4 Pro:** use `batch_size` 2–4 para escolher entre variações. Com 48 GB de memória, o
  Z-Image Turbo bf16 passa a caber e tende a dar mais realismo, mas exige outro workflow
  (diffusion model + text encoder Qwen3-4B + VAE `ae`), CFG 1 e ignora negative prompt; com
  24 GB fica no limite — prefira o RealVisXL.

## Imagens

| Imagem | Evento | Observação |
|---|---|---|
| `eventos/prisao-oposicao` | Agentes do governo prendem líderes da oposição | Saiu só o agente; falta o líder detido algemado. Testar outras seeds ou destacar "two men" no início do prompt. |
