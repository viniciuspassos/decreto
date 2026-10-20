# Trailer "Vitalício"

Ascensão de um ditador, do aplauso na sacada à morte nas mãos de rebeldes. É um trailer novo, fora
da série do repositório, e o único com **violência gráfica liberada**. O título vem do nó **Título
vitalício** (roteiro §S4, Monarquia 1): o presidente vitalício que não chega a envelhecer.

> Versão 3 do roteiro (19/10/2026). As decisões ficam em [Decisões](#decisões) e as escolhas que
> ainda podem mudar, em [Escolhas padrão](#escolhas-padrão-reversíveis).

## Ideia em uma frase

O mesmo enquadramento, a sacada do palácio, abre e vira o trailer: no começo a multidão aplaude, no
fim ela vaia. Entre os dois, o grafo acende em vermelho e o país sangra.

## Decisões

Respostas do Vinicius em 19/10/2026:

1. **Violência gráfica liberada só neste trailer**, no nível do roteiro: sangue, tiros, corpos caindo
   e o corpo do ditador pendurado, sem tortura em detalhe. O jogo continua seguindo o §S6, e genocídio
   ou extermínio de grupos continua fora.
2. **Trailer novo**, independente da série `assets/trailers/` do repositório.
3. **O rosto do ditador nunca aparece**, nem no corpo.
4. **A tela final do jogo mostra só DERROTA: Revolução**, sem comparação com figura histórica.

## Referências

| Referência | O que aproveitamos |
|---|---|
| *O Poderoso Chefão* (1972), sequência do batizado | Montagem cruzada: a cerimônia solene (aqui, a coroação) intercalada com as execuções que ela autoriza. |
| *Scarface* (1983) | Arco de ascensão e queda; o símbolo de poder que vira ironia no fim (aqui, o anel de sinete). |
| Último discurso de Ceaușescu (Bucareste, 21/12/1989) | A virada: um assobio na multidão, o aplauso vira vaia e o líder recua na sacada. |
| Captura de Gaddafi (Sirte, 2011) | O fim: o ditador achado escondido num cano de esgoto. |
| Mussolini em Piazzale Loreto (Milão, 1945) | A coda: o corpo pendurado de cabeça para baixo diante da multidão. |
| Teaser de *A Rede Social* (2010) e trailer de *Gears of War* (2006) | Música lenta e doce (coral, *Mad World*) sobre imagens frias: o contraste dá o desconforto. |
| Trailer de *Coringa* (2019) | Escalada embalada por música "bonita" até o caos; a canção segue tocando enquanto tudo quebra. |
| Trailer de *Dead Island* (2011) | Câmera lenta e silêncio no momento mais violento, em vez de barulho. |
| *Jogos Vorazes: A Esperança, Parte 1* (2014), "The Hanging Tree" | Uma voz sozinha começa a canção e ela vira o hino de guerra dos rebeldes no ataque à represa. Aqui, a melodia do hino do regime volta em tom menor, cantada pela multidão contra ele. |
| *V de Vingança* (2006), a sequência dos dominós | A queda do regime como uma cascata em que uma peça derruba a outra. No jogo, isso já existe: desfazer um nó derruba os dependentes (roteiro §3.17). No fim, o grafo vermelho apaga em cascata. |
| Teaser de *A Rede Social* (2010), estrutura | O primeiro terço parece propaganda, com fotos e coral; só depois o tom vira. O Ato 1 é filmado como um comercial do regime. |

## Linguagem

- **Só imagens.** Sem voz e sem cartelas de texto. O único texto é a interface do jogo no monitor e o
  frame final.
- **Primeira pessoa, sem rosto.** O jogador é o ditador: vemos as mãos dele, nunca o rosto. Ele morre
  em primeira pessoa (5-12). Na coroação ele aparece de costas, e na coda o corpo aparece de longe,
  com o rosto fora do quadro.
- **O anel de sinete.** O fio que liga tudo: a mão o usa para lacrar o primeiro decreto (5-03), ele
  aparece sujo de lama na fuga (5-10c) e identifica o corpo pendurado (5-13). É o modo de reconhecer
  o ditador sem mostrar o rosto.
- **Os cortes encurtam:** 3 s na ascensão, 1–2 s no terror, 1 s na queda. Depois da morte, os planos
  voltam a 3 s.
- **Sem bandeiras reais.** Várias imagens do jogo têm bandeiras dos EUA (`estatuas-obrigatorias`,
  `golpe-militar`, `titulo-vitalicio`) e por isso não entram.
- **Começo e fim da família Decreto.** A abertura (som de caneta, monitor acendendo com DECRETO)
  reaproveita os clipes já gerados, e o fim é o frame final aprovado na v2, com a tagline *"Ninguém
  nasce tirano. Basta um decreto."* caindo sobre a morte.

## Roteiro

Abertura (0–6 s): preto com som de caneta; mãos na mesa e monitor acendendo (**DECRETO**); cursor
sobre o primeiro nó, grafo cinza.

### Ato 1: Ascensão (6–24 s)

Trilha: um coral infantil canta o hino nacional, doce e lento. O ato é filmado como propaganda do regime:
luz dourada, câmera reverente, tudo bonito demais (referência: *A Rede Social*).

| # | Tempo | Plano | Interface |
|---|---|---|---|
| 5-01 | 3 s | Close na mão no mouse, anel de sinete no dedo. Clique. | Nó **Estado de emergência** acende; aprovação **72%** |
| 5-02 | 3 s | 1ª pessoa na sacada do palácio: mãos na balaustrada; abaixo, uma praça lotada aplaude, confete caindo, luzes de celular. | — |
| 5-03 | 3 s | A mão pressiona o anel de sinete na cera vermelha de um decreto. | Nó **Governar por decreto** acende |
| 5-04 | 3 s | O tribunal vazio, as cadeiras dos juízes vazias; a câmera avança devagar até o brasão. | Nó **Controle do Judiciário** acende |
| 5-05 | 3 s | O portão de ferro do Congresso, à noite, fechado com uma corrente. | Nó **Dissolução do Congresso** acende |
| 5-06 | 3 s | Uma estátua colossal do líder em silhueta contra o pôr do sol. | Nó **Estátuas e retratos obrigatórios** acende |

### Ato 2: Coroação e terror (24–33 s)

Montagem cruzada, como o batizado de *O Poderoso Chefão*: a cerimônia e a repressão, alternadas. O
coral passa a um órgão de catedral; cada corte para a violência cai junto com uma nota grave.

| # | Tempo | Plano | Interface |
|---|---|---|---|
| 5-07a | 2 s | Catedral: o ditador, de costas e de manto, diante do altar; a coroa desce sobre ele. | Nó **Coroação** acende |
| 5-07b | 1 s | Um paredão caiado ao amanhecer: os fuzis disparam, os presos caem, o sangue espirra no muro branco. | — |
| 5-07c | 1 s | 1ª pessoa: a borda dourada da coroa desce sobre a câmera. | — |
| 5-07d | 1 s | Rua molhada à noite: a polícia atira num protesto; um estudante cai e o sangue escorre para a sarjeta, ao lado de um tênis perdido. | — |
| 5-07e | 1 s | Na mesma catedral, a fileira de dignitários se ajoelha ao mesmo tempo. | — |
| 5-07f | 1 s | Uma cela de concreto vazia; no chão, um rastro de sangue de algo arrastado. | — |
| 5-08 | 2 s | Close no monitor que banha as mãos de vermelho; os dedos continuam clicando. | Grafo quase todo vermelho; nó **Execuções públicas** acende; alertas **Rebeldes** e **Revolucionários** piscando |

### Ato 3: A virada na sacada (33–37 s)

Referências: o último discurso de Ceaușescu e "The Hanging Tree". A trilha some. Do silêncio sai um
assobio, e depois uma voz sozinha cantando a melodia do hino em tom menor.

| # | Tempo | Plano | Interface |
|---|---|---|---|
| 5-09a | 3 s | **Mesmo quadro de 5-02**, agora cinza e frio: a praça lotada, em silêncio. As mãos apertam a balaustrada. Um único assobio; uma voz começa a cantar. | — |
| 5-09b | 1 s | A multidão inteira entra no canto e explode em vaia; uma pedra voa contra a câmera; as mãos recuam. | — |

### Ato 4: A queda (37–43 s)

O canto da multidão vira hino de guerra, com tambores e o grave da trilha no máximo. Cortes de 1 s.

| # | Tempo | Plano | Interface |
|---|---|---|---|
| 5-10a | 1 s | Um caminhão arrebenta o portão de 5-05; rebeldes de braçadeira entram correndo. | — |
| 5-10b | 1 s | Salão de mármore do palácio: um guarda é baleado e cai, deixando sangue na pedra. | — |
| 5-10c | 1 s | 1ª pessoa, fuga por um túnel de esgoto com lanterna; a mão do anel, suja de lama, se apoia na parede. | — |
| 5-11 | 2 s | 1ª pessoa dentro de um cano de concreto: as mãos erguidas; lanternas e canos de fuzil apontam para a câmera; uma mão agarra a gola. | — |
| 5-12 | 1 s | Clarão de disparo enche o quadro. Corte seco para o preto. Silêncio total. | — |

### Ato 5: Coda (43–49 s)

Depois do silêncio, sinos de igreja e o burburinho da praça. O canto dos rebeldes termina numa
última nota longa, que se apaga com o monitor.

| # | Tempo | Plano | Interface |
|---|---|---|---|
| 5-13 | 3 s | Dia, a praça de 5-02 vista do meio da multidão: a cabeça da estátua caída no chão, gente pisando nela. Ao fundo, um corpo pendurado de cabeça para baixo numa viga, o rosto fora do quadro; na mão pendente, o anel de sinete. | — |
| 5-14 | 3 s | O gabinete do jogo, vazio: janela estilhaçada, papéis no chão, o monitor ainda aceso e respingado de sangue. | Os nós vermelhos apagam **em cascata**, como dominós, e sobra **DERROTA: Revolução** |

Encerramento (49–54 s): preto com o som da caneta; frame final com a tagline e **DECRETO**.

**Duração total: 54 s.** Os planos 5-04, 5-05, 5-06, 5-07a e 5-14 foram ajustados para casar com as
imagens do jogo que servem de base (ver pipeline).

## Pipeline

Mesmo caminho aprovado para o trailer v3: as imagens do jogo são a base, animadas por parallax 2.5D
ou por imagem para vídeo, com acabamento de upscale e RIFE. A diferença é que aqui muitos planos não
existem nas imagens do jogo (sacada, paredão, esgoto, corpo), então eles começam por uma **imagem
nova** gerada no ComfyUI.

### Quem faz o quê

| Quem | O que faz |
|---|---|
| **Eu (Claude, aqui na nuvem)** | Prompts de cada imagem e clipe; a **interface do jogo** gravada do `apps/web` (grafo, nós acendendo, alertas, aprovação, DERROTA: Revolução), com fundo transparente para entrar no monitor; o **clarão** de 5-12; o **frame final** (o mesmo da v2); a escolha dos **efeitos sonoros** (assobio, vaia, tiros, sinos, multidão) em bibliotecas de licença CC0; a **conferência dos quadros** de cada lote (rosto, bandeira, texto inventado, sangue no ponto certo); e um animatic de revisão quando você liberar vídeos. |
| **ComfyUI (no seu Mac, via MCP)** | As **imagens novas** dos planos sem base; a **imagem para vídeo** com o Wan 2.2; o **parallax 2.5D** com Depth Anything nos planos quase parados; **upscale e RIFE** para 1080p a 24 fps; e a **trilha** com o ACE-Step. Tudo com modelos gratuitos que rodam no M4 Pro de 24 GB. |
| **FilmCraft (no seu Mac, via MCP)** | A **montagem** na linha do tempo; a **interface sobre o monitor** dos planos 5-01, 5-03 a 5-08 e 5-14; a **cor**; a **mixagem** da trilha com os efeitos; e a **exportação** em 1080p a 24 fps, deixando um projeto editável. |

### Plano a plano

"Imagem do jogo" é um arquivo de `assets/images-game`. "Imagem nova" é gerada no ComfyUI antes de
animar.

| # | Base | Animação (ComfyUI) | Interface e som (eu) |
|---|---|---|---|
| Abertura | Clipes `a2-s42` e `a3-s42` já gerados | Upscale e RIFE | Tela DECRETO; som de caneta |
| 5-01 | Imagem nova: mão com anel no mouse | Imagem para vídeo (clique) | Grafo, nó e aprovação |
| 5-02 | Imagem nova: sacada e multidão, sem rostos em destaque e sem bandeiras | Imagem para vídeo (aplauso, confete) | Aplauso |
| 5-03 | Imagem nova: anel sobre a cera vermelha | Imagem para vídeo | Nó |
| 5-04 | Imagem do jogo: `controle-do-judiciario` | Parallax | Nó |
| 5-05 | Imagem do jogo: `dissolucao-do-congresso`, com a corrente pintada por cima no ComfyUI | Parallax | Nó; corrente |
| 5-06 | Clipe `realista-v1/estatua.mp4`, já gerado | Upscale e RIFE | Nó |
| 5-07a | Imagem do jogo: `coroacao` | Imagem para vídeo (coroa desce) | Nó; órgão |
| 5-07b | Imagem nova: paredão | Imagem para vídeo | Rajada |
| 5-07c | Imagem nova: coroa vista de baixo | Imagem para vídeo | — |
| 5-07d | Imagem do jogo `militares-nas-ruas` como referência da rua | Imagem para vídeo | Tiros |
| 5-07e | Imagem do jogo: `coroacao` | Imagem para vídeo (ajoelhar) | — |
| 5-07f | Imagem do jogo `tortura` com o rastro de sangue pintado por cima | Parallax | Porta de cela |
| 5-08 | Imagem nova: mãos sob luz vermelha | Imagem para vídeo | Grafo vermelho e alertas |
| 5-09a | A imagem de 5-02, refeita fria e sem confete | Imagem para vídeo | Silêncio e assobio |
| 5-09b | A imagem de 5-09a | Imagem para vídeo (vaia, pedra) | Vaia |
| 5-10a | Imagem do jogo: `dissolucao-do-congresso` | Imagem para vídeo (caminhão) | Impacto |
| 5-10b | Imagem do jogo `morte` (salão de mármore) como referência | Imagem para vídeo | Tiro |
| 5-10c | Imagem nova: túnel de esgoto | Imagem para vídeo | Respiração, passos |
| 5-11 | Imagem nova: dentro do cano, fuzis | Imagem para vídeo | Gritos abafados |
| 5-12 | — | — | Clarão gerado por mim; tiro e silêncio |
| 5-13 | Imagem nova: praça e corpo pendurado | Parallax (mais controle sobre o rosto e o sangue) | Sinos, multidão, fim do canto |
| 5-14 | Imagem do jogo `governar-por-decreto`, com janela quebrada e sangue pintados por cima | Parallax | Cascata do grafo e DERROTA: Revolução |
| Fim | Frame final da v2 | — | Caneta e golpe grave |

São 12 imagens novas (duas delas a partir de imagens do jogo), 3 imagens do jogo retocadas, 15
clipes de imagem para vídeo, 5 parallax e 3 clipes reaproveitados.

### Ordem de produção

1. **Teste de violência (2 planos):** 5-07b e 5-13, para ver se o Wan 2.2 local faz sangue realista e
   respeita o rosto escondido. Esses planos usam um *negative prompt* próprio, numa cópia do workflow;
   o `_base.api.json` do repositório continua bloqueando violência.
2. **Imagens novas e retoques:** todas, de uma vez, para eu conferir antes de animar.
3. **Animação:** imagem para vídeo, parallax, upscale e RIFE.
4. **Trilha:** ACE-Step com a estrutura do roteiro (coral, órgão, silêncio, voz sozinha, canto da
   multidão com tambores). A melodia do hino precisa ser a mesma em tom maior e menor; eu escrevo a
   melodia, e se o ACE-Step não a seguir, monto essas duas partes por síntese.
5. **Interface, clarão, frame final e efeitos:** comigo, em paralelo aos passos 2 a 4.
6. **Montagem, cor, mixagem e exportação** no FilmCraft.

**Ressalvas:**
- O ComfyUI do seu Mac está rodando agora os testes do trailer v3. Este pipeline entra depois, para
  não dividir a máquina.
- Ainda não vi os resultados dos testes do v3 (parallax, trilha e upscale). Se algum falhar, o mesmo
  passo muda aqui.
- Não confirmei pessoalmente o que o FilmCraft faz. A divisão acima vem da outra thread, que o
  testou.

## Escolhas padrão (reversíveis)

Sem resposta às duas dúvidas, a produção começou com as opções recomendadas:

1. **Visual preto e branco com vermelho**, como no v3. O vermelho fica só no sangue, na cera do anel
   e no grafo.
2. **Efeitos sonoros só de licença CC0**, livres inclusive para uso comercial.
