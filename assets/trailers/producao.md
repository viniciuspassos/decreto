# Trailers do Decreto: produção dos clipes

Referência para gerar os clipes de vídeo dos trailers ([roteiros](comum.md)) no ComfyUI local. Diz
**qual modelo usar e por quê**, **como escrever os prompts**, **como rodar o lote pela CLI** e
**como acompanhar pela UI do ComfyUI**, sem precisar de Claude ou Codex durante a geração.

## Resumo

| Item | Decisão |
|---|---|
| Máquina | Mac M4 Pro, 24 GB de memória unificada, ComfyUI Desktop (MPS) |
| Modelo | **Wan 2.2 T2V A14B em GGUF Q4_K_M** + LoRA lightx2v de 4 passos (texto → vídeo) |
| Clipe | **2 s**: 33 quadros, 832×480, 16 fps |
| Tempo | **~14–15 min por clipe**, ou ~4 clipes por hora |
| Pós-produção | ffmpeg: interpolação para 24 fps, câmera lenta 1,5× (2 s viram 3 s), ampliação para 1080p |
| Montagem | Editor de vídeo (DaVinci Resolve) ou ffmpeg |
| Geração | `pnpm generate:trailer-clips`, rodado pela CLI, à noite |
| Acompanhamento | Painel de fila da UI do ComfyUI e saída do terminal |

## Por que este modelo e este formato

Testes feitos em 18/10/2026 nesta máquina:

| Modelo | Resultado |
|---|---|
| Wan 2.2 TI2V 5B | ❌ Gera só ruído no MPS, em fp16 e bf16. É um bug conhecido do ComfyUI (issue #16644, ainda aberta). Removido. |
| Wan 2.1 T2V 1.3B | ❌ Em 5 s sai imagem corrompida e leva 1 h 54 min. Só funciona com 1 quadro. |
| **Wan 2.2 T2V A14B GGUF Q4_K_M + lightx2v** | ✅ **Em 2 s a qualidade é ótima e estável.** Obedece a ações simples do prompt, como uma tela que acende. |

**O limite não é o modelo, é o tamanho do vídeo.** No Mac, a atenção do ComfyUI só funciona até
cerca de 14 mil tokens por clipe. Em 832×480, isso dá 33 quadros. Os três algoritmos de atenção
foram testados:

| Atenção | Resultado |
|---|---|
| Sub-quadratic (padrão do MPS) | ✅ Funciona até ~14 mil tokens. Acima disso, sai imagem corrompida e fica muito lento. |
| `--use-pytorch-cross-attention` | ❌ Monta a matriz inteira e tenta alocar ~80 GB |
| `--use-split-cross-attention` | ❌ Calcula errado a memória livre do Mac e tenta alocar 61 GB |

Por isso:
- **Não aumente `length` nem a resolução** em `_base.api.json`. Com 49 ou 81 quadros, a imagem sai
  corrompida.
- **Não adicione flags de atenção** em `launchArgs`, no arquivo
  `~/Library/Application Support/Comfy Desktop/installations.json`. O valor deve ficar só
  `"--enable-manager"`. Edite esse arquivo apenas com o app encerrado por ⌘Q.
- **Separar as fases high e low noise em jobs diferentes não acelera.** Foi testado: o swap cai de
  17 GB para ~3 GB, mas o tempo por passo continua igual. O gargalo é o cálculo na GPU, não a
  memória. Durante o lote o swap fica alto (~17 GB). Isso é esperado; é por isso que o lote roda à
  noite.

Se no futuro for preciso mais qualidade ou clipes mais longos, as alternativas são uma GPU alugada
na nuvem, onde os mesmos workflows rodam em 720p e 5 s, ou uma API paga só para os planos de maior
impacto.

## Instalação

Pastas: modelos em `~/ComfyUI-Shared/models/`; saídas do ComfyUI em `~/ComfyUI-Shared/output/`.

| Arquivo | Pasta | Origem |
|---|---|---|
| `Wan2.2-T2V-A14B-HighNoise-Q4_K_M.gguf` (~9,6 GB) | `diffusion_models/` | [QuantStack/Wan2.2-T2V-A14B-GGUF](https://huggingface.co/QuantStack/Wan2.2-T2V-A14B-GGUF), pasta `HighNoise/` |
| `Wan2.2-T2V-A14B-LowNoise-Q4_K_M.gguf` (~9,6 GB) | `diffusion_models/` | mesmo repositório, pasta `LowNoise/` |
| `wan2.2_t2v_lightx2v_4steps_lora_v1.1_high_noise.safetensors` | `loras/` | [Comfy-Org/Wan_2.2_ComfyUI_Repackaged](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged), `split_files/loras/` |
| `wan2.2_t2v_lightx2v_4steps_lora_v1.1_low_noise.safetensors` | `loras/` | mesmo repositório |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `text_encoders/` | mesmo repositório, `split_files/text_encoders/` |
| `wan_2.1_vae.safetensors` | `vae/` | mesmo repositório, `split_files/vae/` |

Nó de terceiros: **ComfyUI-GGUF** (city96), que fornece o nó `UnetLoaderGGUF`. Instale pelo
ComfyUI-Manager. Depois de instalar modelos ou nós, reinicie o app.

## Pipeline (`_base.api.json`)

O template fica em [`_base.api.json`](_base.api.json), no formato API do ComfyUI. O script clona o
template e preenche, para cada clipe, o prompt (nó `2`), a seed (nó `5`) e o nome do arquivo (nó
`7`). O resto é fixo:

- dois `UnetLoaderGGUF` (high noise e low noise), cada um com sua LoRA lightx2v (força 1.0) e
  `ModelSamplingSD3` com shift 5;
- dois `KSamplerAdvanced` com 4 passos no total, cfg 1, euler/simple:
  - high noise nos passos 0–2, devolvendo o ruído restante;
  - low noise nos passos 2–fim, sem adicionar ruído;
- `EmptyHunyuanLatentVideo` 832×480 com 33 quadros, `VAEDecode` com o VAE do Wan 2.1, e
  `CreateVideo` a 16 fps;
- **negative prompt fixo**: o padrão do Wan, mais logos, marcas, texto, marca d'água, bandeiras
  nacionais e violência gráfica (sangue, ferimentos, corpos), conforme o roteiro §S6.

Não edite o prompt em `_base.api.json`. Ele é sempre preenchido pelo script.

## Como escrever os prompts

Regras tiradas dos testes:

- **Em inglês.** Descreva uma cena e **um único gesto contínuo** por clipe. Transições acontecem na
  edição, num corte entre dois clipes.
- **Diga o enquadramento de forma explícita:** de onde a câmera olha, o que está em primeiro plano e
  o que *não* aparece. Exemplo: *"The palace itself is not visible, only the balustrade in the
  foreground"*. Sem isso, o modelo escolhe sozinho e costuma errar.
- **Primeira pessoa sem rosto:** comece com *"First-person point of view."* e descreva só as mãos.
  Mesmo assim, em planos abertos o modelo tende a pôr o governante em cena, de costas. Confira.
- **Nada de bandeiras.** O modelo transforma "multidão com bandeiras" em bandeiras nacionais reais,
  mesmo com o negative prompt. Use *"raised hands"*, *"phone lights"*, *"torches"* ou *"plain
  single-color banners"*, e confira o resultado.
- **Nada de marcas ou logos.** Peça objetos genéricos: *"old beige CRT computer monitor"*, não o
  nome de uma marca.
- **Telas só brilhando.** O Wan não gera texto legível. Peça *"screen switches on and glows bright
  cold blue-white"*; a interface do jogo entra por cima na edição.
- **Sem violência gráfica (roteiro §S6).** Mostre a consequência por sombras, objetos e reações.
- Feche com o estilo comum: *"Cinematic, shallow depth of field, slow push-in, moody low-key
  lighting, film grain."*

## Gerar os clipes pela CLI

O comando roda no seu terminal e conversa direto com o ComfyUI. **Não usa Claude nem Codex**:
nenhum token é gasto durante a geração. Use o agente só para escrever prompts e avaliar os
resultados.

### 1. Adicionar os planos em `clips.json`

Cada entrada de [`clips.json`](clips.json) gera
`assets/trailers/clips/<category>/<name>.mp4`:

```json
{
  "category": "mandato",
  "name": "1-03-eleicao-take1",
  "prompt": "First-person point of view. ...",
  "seed": 42
}
```

- `category`: a parte do trailer (`abertura`, `mandato`, `ordem-e-futuro`, `decreto`).
- `name`: o número do plano no roteiro, mais um sufixo. Use só letras minúsculas, números e hífen.
- `seed`: opcional, o padrão é 42. **Para gerar mais de uma tentativa do mesmo plano, repita a
  entrada com outro `name` (`-take2`) e outra `seed`.**

### 2. Testar um plano antes do lote

```sh
pnpm generate:trailer-clips --only 1-03-eleicao-take1
```

Leva ~15 min. Abra o `.mp4` gerado e ajuste o prompt se for preciso.

### 3. Rodar o lote (à noite)

```sh
mkdir -p assets/trailers/clips
caffeinate -i pnpm generate:trailer-clips 2>&1 | tee -a assets/trailers/clips/lote.log
```

- `caffeinate -i` impede o Mac de dormir durante o lote.
- O terminal mostra uma linha por clipe concluído, com o horário. O `tee` guarda essas linhas em
  `lote.log`.
- **Clipes já gerados são pulados.** Se o lote parar (erro, Mac reiniciado, app fechado), basta
  rodar o mesmo comando de novo: ele continua de onde parou. Para refazer um clipe, apague o `.mp4`
  ou use `--force --only <name>`.
- **Um erro interrompe o lote** assim que o ComfyUI o informa, com a mensagem do ComfyUI. Corrija a
  entrada e rode de novo.
- Para estimar a duração de um lote, conte ~15 min por entrada. Com 20 entradas, são ~5 h.
- **Não use o ComfyUI para outra coisa durante o lote.** O limite de 60 min por clipe conta também o
  tempo na fila. Um job manual na UI atrasa o clipe da vez e pode estourar esse limite.
- Outras opções: `--force` regera tudo; `--comfy-url` (ou a variável `COMFYUI_URL`) aponta para
  outro ComfyUI.

Os clipes ficam em `assets/trailers/clips/`, pasta que está no `.gitignore` (material bruto). Uma
cópia também fica em `~/ComfyUI-Shared/output/decreto/<category>/`.

## Acompanhar pela UI do ComfyUI

O lote roda pela API, então **o workflow não aparece aberto no canvas**, e a barra de progresso do
nó KSampler não aparece. Para acompanhar:

1. **Painel de fila:** na barra lateral esquerda do ComfyUI Desktop, abra o ícone de **Fila /
   Queue** (às vezes chamado *Jobs* ou *History*). O job em execução aparece no topo com a barra de
   progresso. Os próximos clipes não aparecem como pendentes, porque o script envia um clipe por
   vez, só quando o anterior termina.
2. **Título da janela:** durante a execução, mostra a porcentagem do job, como `[47%] ComfyUI`.
3. **Prévia do resultado:** clipes prontos aparecem no histórico do mesmo painel. Clique num deles
   para assistir ou para carregar o workflow no canvas.

O log do ComfyUI (`~/ComfyUI-Installs/comfyui/ComfyUI/user/comfyui.log`) só registra o progresso
da amostragem quando ela termina, então não serve para acompanhar ao vivo.

**Ritmo esperado por clipe:** ~6 min na fase high noise (2 passos de ~3 min), ~6 min na fase low
noise e ~1,5 min para decodificar. Se o primeiro passo passar de 10 min, ou se o vídeo sair
corrompido, confira se `launchArgs` está só com `"--enable-manager"`.

## Pós-produção com ffmpeg

Instale com `brew install ffmpeg`. Para tratar cada clipe (interpolação para 24 fps, câmera lenta
1,5× e 1080p):

```sh
ffmpeg -i entrada.mp4 -vf "setpts=1.5*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=1920:1080:flags=lanczos,format=yuv420p" -c:v libx264 -crf 16 -preset slow saida.mp4
```

Para juntar dois clipes já tratados com um crossfade de 0,5 s (`offset` é a duração do primeiro
clipe menos 0,5):

```sh
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=2.59[v]" -map "[v]" -c:v libx264 -crf 16 saida.mp4
```

A montagem final, com gravação de tela do jogo sobre o monitor, frame final, trilha e som, é feita
num editor de vídeo como o DaVinci Resolve. O Wan não gera áudio.

**Durações no roteiro:** cada clipe gerado tem 2 s, ou 3 s depois da câmera lenta. Planos maiores no
roteiro viram 2 ou 3 clipes encadeados por cortes.
