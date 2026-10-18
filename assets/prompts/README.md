# Prompts de geração de imagem

Geram as imagens de `assets/images/<categoria>/<nome>.png` a partir de um workflow do ComfyUI
reutilizável — um único template, um prompt por imagem.

**`categoria` é o nome do evento** (`eventName` na tabela `event_images`, a mesma chave usada pela
API em `GET /events/:eventName/image`) — ex.: `posse`, `comicio`, `eleicao`, `atentado`, `morte`.
Um evento pode ter **mais de uma imagem**: basta acrescentar outra entrada no manifest com a mesma
`category` e um `name` diferente (ex.: `comicio/palanque.png` e `comicio/multidao.png`); a API
escolhe uma delas ao acaso a cada chamada (`findImageForEvent`, `ORDER BY random()`). Depois de
gerar, registre cada `fileLocation` em `apps/api/src/db/seed.ts` sob o mesmo `eventName`.

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

## Pré-requisitos

1. **ComfyUI rodando** em `127.0.0.1:8188` (ComfyUI Desktop ou `comfy launch`).
2. **Checkpoint instalado**: baixe `RealVisXL_V5.0_Lightning_fp16.safetensors` (SDXL destilado,
   ~6,9 GB) de https://huggingface.co/SG161222/RealVisXL_V5.0_Lightning e coloque em
   `models/checkpoints/` do ComfyUI. Não precisa de VAE, LoRA nem nós customizados. Se o ComfyUI já
   estava aberto antes do download, reinicie-o (ele só lê a pasta de checkpoints na inicialização).
3. **Dependências do repo instaladas**: `pnpm install` na raiz (instala o pacote
   `tools/generate-images`).

## Parâmetros (padrão de todos os workflows)

| Parâmetro | Valor |
|---|---|
| Resolução | 1088×1024 (proporção do quadro da tela de evento) |
| Passos | 6 |
| CFG | 1,5 |
| Sampler / scheduler | `dpmpp_sde` / `karras` |

## Gerar imagens

### 1. Adicionar entradas ao manifest

Edite `assets/prompts/manifest.json` e acrescente uma entrada por imagem:

```json
{
  "category": "atentado",
  "name": "tentativa",
  "prompt": "cinematic video game screenshot, Unreal Engine 5, photorealistic. ..."
}
```

- `category`: o nome do evento (`eventName`), minúsculo, só letras/números/hífen (`[a-z0-9-]+`).
  Use o mesmo `category` em várias entradas para dar **mais de uma imagem ao mesmo evento**.
- `name`: identifica a variante dentro do evento (minúsculo, `[a-z0-9-]+`) — junto com `category`
  define o destino `assets/images/<category>/<name>.png`.
- `prompt`: só o prompt **positivo**. O negative prompt (bloqueia violência gráfica/sangue, roteiro
  §6) já é fixo no template e não deve ser repetido aqui.
- `seed` (opcional): número fixo para reproduzir uma geração específica; se omitido, usa a seed do
  template (`_base.api.json`).

O manifest já tem as **100 entradas do roteiro**: um nó por árvore de política (S1, inclui as
variações de intensidade de impostos como uma entrada ilustrativa) mais os eventos universais do
loop principal (`posse`, `comicio`, `eleicao`, `atentado`, `morte`, `golpe-militar`,
`prisao-oposicao`). O script processa todas, uma a uma.

### 2. (opcional) Testar o prompt no ComfyUI Desktop antes de rodar o lote

Abra `assets/prompts/_base.workflow.json` no ComfyUI Desktop (arraste o arquivo para a janela do
app, ou File → Open Workflow), edite o texto do nó "Prompt positivo", clique em "Run" e confira o
resultado. É o mesmo pipeline do template usado pelo script — só em formato visual, para testar
seed/prompt rapidamente sem editar o manifest.

### 3. Rodar o script

Com o ComfyUI aberto (pré-requisito 1):

```bash
pnpm --filter @decreto/generate-images generate
```

Lê `assets/prompts/manifest.json`, e para cada entrada: clona `_base.api.json`, troca o
prompt/seed/destino, envia para a fila do ComfyUI (`POST /prompt`), espera terminar (`GET
/history/<id>`) e baixa o PNG (`GET /view`) direto para `assets/images/<categoria>/<nome>.png` — sem
passo manual de copiar arquivo. Entradas cujo arquivo de destino já existe são puladas (log
`[skipped] ...`); as novas saem como `[generated] ...`.

Como o ComfyUI local roda um job por vez, o script gera as imagens **em sequência** (não em
paralelo) — para 100 entradas, espere algo como 100 × tempo por imagem (ver tabela "Máquina"
abaixo).

Flags:

| Flag | Efeito |
|---|---|
| `--only <nome>` | gera só a entrada com esse `name`, ignora as demais |
| `--force` | regera mesmo que o arquivo de destino já exista |
| `--comfy-url <url>` | usa outro ComfyUI (padrão: `http://127.0.0.1:8188`, ou a env `COMFYUI_URL`) |
| `--manifest <caminho>` | usa outro arquivo de manifest (padrão: `assets/prompts/manifest.json`) |

```bash
# gera (ou regera) só uma entrada, mesmo que o arquivo já exista
pnpm --filter @decreto/generate-images generate -- --only tentativa --force

# aponta para outro ComfyUI (ex.: outra máquina na rede)
pnpm --filter @decreto/generate-images generate -- --comfy-url http://192.168.1.10:8188
```

### Erros comuns

- `ComfyUI recusou o prompt: ...` — ComfyUI não está rodando em `127.0.0.1:8188`, ou o checkpoint
  não está instalado/visível (reinicie o ComfyUI após colocar o arquivo em `models/checkpoints/`).
- `tempo esgotado esperando o prompt ...` — geração demorou mais que 5 minutos (padrão); confira a
  fila no próprio ComfyUI, pode haver outro job pesado rodando na frente.
- `ComfyUI não retornou imagem para "<nome>"` — o workflow rodou mas o nó `SaveImage` não produziu
  saída; confira o log do ComfyUI para o erro real.

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
| `prisao-oposicao/prisao-oposicao` | Agentes do governo prendem líderes da oposição | Saiu só o agente; falta o líder detido algemado. Testar outras seeds ou destacar "two men" no início do prompt. |
| `posse/juramento` | Posse presidencial | — |
| `comicio/palanque` | Comício de campanha | — |
| `eleicao/apuracao` | Noite de apuração da eleição | — |
| `atentado/tentativa` | Atentado sofrido pelo presidente (sobrevive) | Sem sangue/ferimentos visíveis, por design (roteiro §6). |
| `morte/velorio-oficial` | Morte do presidente (atentado fatal) | Caixão fechado, sem corpo visível (roteiro §6). |
