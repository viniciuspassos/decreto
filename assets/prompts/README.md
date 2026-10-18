# Prompts de geração de imagem

Geram as imagens de `assets/images/<categoria>/<nome>.png` a partir de um workflow do ComfyUI
reutilizável — um único template, um prompt por imagem.

- **`_base.api.json`** — o template, no formato API do ComfyUI. Tem um só nó de prompt positivo
  (texto `"{{PROMPT}}"`), um negative prompt fixo (bloqueia violência gráfica/sangue, roteiro §6) e
  os parâmetros padrão da tabela abaixo. Não editar o prompt deste arquivo diretamente — ele é
  sempre clonado e preenchido pelo script.
- **`_base.workflow.json`** — o mesmo pipeline no **formato UI** do ComfyUI (nodes/links/posições),
  para abrir e editar visualmente no ComfyUI Desktop (arraste o arquivo para a janela do app, ou
  File → Open Workflow). Use para testar prompts manualmente antes de colocá-los no manifest.
- **`manifest.json`** — lista as imagens a gerar: `{ "category", "name", "prompt", "seed"? }` por
  entrada. `seed` é opcional (mantém a do template se omitido). Cada entrada gera
  `images/<category>/<name>.png`.

As imagens aparecem após eventos marcantes (roteiro §8). Tom de "simulação séria": repressão
aparece de forma sóbria, sem violência gráfica, sangue ou ferimentos (roteiro §6) — por isso o
negative prompt é fixo no template e **não** faz parte do manifest.

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

Com o ComfyUI aberto em `127.0.0.1:8188`, para gerar todo o lote do `manifest.json` (pula imagens
que já existem em `assets/images/`):

```bash
pnpm --filter @decreto/generate-images generate
```

Flags úteis:

```bash
# gera (ou regera) só uma entrada, mesmo que o arquivo já exista
pnpm --filter @decreto/generate-images generate -- --only golpe-militar --force

# aponta para outro ComfyUI (ex.: outra máquina na rede)
pnpm --filter @decreto/generate-images generate -- --comfy-url http://192.168.1.10:8188
```

O script lê `manifest.json`, para cada entrada clona `_base.api.json`, troca o prompt/seed/destino,
envia para a fila do ComfyUI (`/prompt`), espera terminar (`/history`) e grava o PNG direto em
`assets/images/<categoria>/<nome>.png` — sem passo manual de copiar arquivo.

Para testar um prompt novo antes de colocá-lo no manifest, use `_base.workflow.json` no ComfyUI
Desktop (veja acima) ou rode manualmente com `comfy run --workflow <arquivo API>`.

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
