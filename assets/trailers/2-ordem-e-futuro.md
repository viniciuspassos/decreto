# Trailer 2: "Ordem e Futuro"

Roteiro do miolo (10–55 s). Linguagem comum, abertura (A1–A3), encerramento (E1) e produção em
[comum.md](comum.md).

Utopia **inventada para o trailer** (não é uma das 5 do jogo), misturando direita e esquerda. Nome
de trabalho: **"A Nação Concórdia"**. Visual: perfeição limpa, simétrica e levemente inquietante.

| Esquerda | Direita |
|---|---|
| Renda básica universal | Família tradicional como base do Estado |
| Saúde e educação 100% gratuitas | Fronteiras fechadas |
| Fim da pobreza, moradia idêntica para todos | Patriotismo obrigatório, hino diário |
| Transição ecológica total | Zero imposto para empresas, ordem e disciplina |

| # | Tempo | Plano (IA) | Interface |
|---|---|---|---|
| 2.1 | 4 s | Clique. Corte: fila num terminal que entrega um cartão; uma mulher sorri. | Nó **Renda básica** acende |
| 2.2 | 4 s | Clique. Corte: muro branco e limpo entre colinas verdes, ao amanhecer. | Nó **Muro na fronteira** acende |
| 2.3 | 4 s | Clique. Corte: bairro de casas idênticas, gramados perfeitos, crianças de uniforme. | Nó **Moradia para todos** acende |
| 2.4 | 4 s | Escola: crianças em fila cantam o hino diante da bandeira; painéis solares no telhado. | — |
| 2.5 | 3 s | Close no monitor. | Grafo aceso dos **dois lados** ao mesmo tempo, em simetria; barra de capital no máximo |
| 2.6 | 6 s | A câmera sobe da mesa, atravessa a janela e chega à cidade: avenidas simétricas, verde, trens silenciosos, drones de vigilância suaves. | — |
| 2.7 | 4 s | Cidadãos votam no celular ao mesmo tempo; no telão da praça, uma barra verde completa. Corte seco. | — |
| 2.8 | 5 s | Uma família à mesa de jantar, todos sorrindo de forma idêntica; ninguém fala. Um quadro do líder, de costas/fora de foco, na parede. | — |
| 2.9 | 6 s | Plano aéreo final: a nação inteira, perfeita, ao pôr do sol. A câmera não para de subir. | — |
| 2.10 | 5 s | De volta ao gabinete. As mãos não se mexem. | **UTOPIA INSTALADA** |
| | **45 s** | → Encerramento compartilhado | |

Clipes de IA: 10.

## Demo v0 (sem IA)

Versão de demonstração de **10 s** com os planos 2.1–2.10 comprimidos, desenhada em HTML/SVG
([`tools/trailer-demo/pages/2-ordem-e-futuro.html`](../../tools/trailer-demo/pages/2-ordem-e-futuro.html))
e gravada quadro a quadro (30 fps, 1080p) com Playwright + ffmpeg. Sem trilha. Abra o HTML no
navegador para ver em loop (`?lang=en` para inglês) ou grave os MP4 em pt-BR e en com
`pnpm record:trailer-demo`, que salva em `assets/trailers/clips/2-ordem-e-futuro/demo-v0-{lang}.mp4`.
