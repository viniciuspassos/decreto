# Trailer "Vitalício": roteiro v5

> 20/10/2026. Nenhuma mídia foi gerada para esta versão. Substitui o v4 (`roteiro-v4.md` fica como histórico).

## Decisões do Vinicius que valem para o v5

- Duração de até 2 min 10 s.
- O anel termina com quem fez a revolução, que vira a nova tirana.
- O rosto só é escondido no ditador. Todos os outros personagens podem aparecer de frente.
- Liberdade criativa total. O trailer não precisa mostrar a interface do jogo nem seguir os dados dele.
- A voz dela na praça é sintetizada no Mac (ACE-Step, pelas ferramentas MCP do Vinicius); não há quem grave.
- Continuam valendo as decisões anteriores: violência gráfica liberada só neste trailer, e visual em preto e
  branco com o vermelho preservado.

## O que mudou do v4 e por quê

1. **A revolução ganha um rosto: a menina da fita vermelha.**
   - **Arco 1:** com 9 anos, ela canta o hino do regime no coral infantil, logo abaixo da sacada. Na noite em
     que levam o pai, ela assiste escondida debaixo da mesa e recolhe a fita que caiu do cabelo.
   - **Arco 2:** com uns 17 anos, está no mesmo tipo de cerimônia, mas de boca fechada e com a fita amarrada no
     pulso. A fita vira o sinal da revolta. Na praça, é ela quem começa a cantar o hino em tom menor, sozinha.
   - **Arco 3 e coda:** é a mão dela que arranca o anel do ditador, e é ela quem termina na sacada.

   No preto e branco, a fita é o único vermelho que não é sangue nem cera. **O vermelho muda de lado**, e no fim
   volta para o lado do poder. Uma personagem só, e não três, deixa a história clara em 2 minutos sem diálogo.
2. **Saiu toda a interface do jogo.** O grafo de nós vira um objeto físico: a pilha de decretos lacrados, que cresce
   na ascensão e queima na queda. A marca do jogo fica no som da caneta assinando e no frame final **DECRETO**.
3. **A queda tem causas filmadas:** a fome, as velas nas janelas, as fitas passando de pulso em pulso, a caneta do
   ditador que falha, a fita amarrada no cano do fuzil de um soldado e o telefone tocando num quartel vazio.
4. **O ciclo fecha com uma imagem.** Ela ergue a mão com o anel na mesma sacada, sob a mesma luz dourada e os mesmos
   aplausos do Arco 1. Está de costas, sem rosto, como o ditador. O coral infantil volta em tom maior, e o último
   plano é o anel lacrando um decreto novo, que é o mesmo clipe do Arco 1 (♻ 5-03).
5. **Quatro intertítulos** em letras brancas com serifa, no estilo do frame final, marcam as viradas. O terceiro
   também resolve o salto de anos sem precisar de "anos depois":
   - *PROMETEU ORDEM.*
   - *EXIGIU SILÊNCIO.*
   - *ESQUECEU QUE AS CRIANÇAS CRESCEM.*
   - *NINGUÉM NASCE TIRANO. BASTA UM DECRETO.*

   Também saem em inglês: *HE PROMISED ORDER. / HE DEMANDED SILENCE. / HE FORGOT THAT CHILDREN GROW UP. / NO ONE
   IS BORN A TYRANT. ONE DECREE IS ENOUGH.*

Ficam do v4 o prólogo que começa pelo fim, o soldado que abaixa a arma, a queda em ordem inversa e o heliponto
vazio. Sai o tênis no fio, porque a fita faz o mesmo papel e dois símbolos do povo competiriam entre si.

## Estrutura

| Parte | Tempo | Duração | O que conta |
|---|---|---|---|
| Prólogo | 0–5 s | 5 s | O fim: uma lanterna acerta a mão com o anel. |
| Arco 1: a ditadura surge | 5–46,5 s | 41,5 s | Caos, promessa, aplauso, decretos, coroa, terror; levam o pai da menina. |
| Arco 2: a revolução começa | 46,5–84 s | 37,5 s | Anos depois: fome, velas, fitas, a caneta falha, o exército vira, a praça canta. |
| Arco 3: a queda | 84–106,5 s | 22,5 s | Tudo o que foi erguido cai em ordem inversa, até a captura e o tiro. |
| Coda | 106,5–123 s | 16,5 s | O corpo, o anel no dedo dela, a sacada, o lacre, o título. |

**Total: cerca de 2 min 3 s.** Sobram 7 s até o limite para ajustar na montagem. A ascensão ocupa um terço do
trailer; a revolta e a queda ocupam o resto.

## Trilha: o hino como fio

Eu escrevo a melodia do hino (com letra curta em português), e todas as músicas saem dela. O arco da música é o
arco da menina:

1. **Prólogo:** respiração, gotas e silêncio. No preto, a voz da menina canta a primeira nota do hino.
2. **Arco 1:** o coral infantil canta o hino em tom maior, doce. Com o terror entra o órgão, que para de repente na
   noite em que levam o pai. Sobra só a chuva.
3. **Arco 2:** o hino volta distorcido; é o próprio áudio do Arco 1, processado. Na praça, ela canta sozinha em tom
   menor, e a multidão inteira a segue.
4. **Arco 3:** o hino em tom menor vira canto de guerra, com tambores. Depois do tiro vêm 3 s de silêncio total.
5. **Coda:** sinos. Na sacada dela, o coral infantil volta em tom maior, idêntico ao do Arco 1.

## Plano a plano

`♻` = reaproveita um clipe da v0 (id entre parênteses). `NOVO` = gerar no ComfyUI. `PX` = parallax sobre imagem
parada (mais barato que o Wan). `TXT` = intertítulo, feito por mim.

### Prólogo (0–5 s)

| # | Dur. | Plano | Origem | Som |
|---|---|---|---|---|
| P-01 | 1,5 | Preto. | — | respiração ofegante, gotas |
| P-02 | 2,5 | Dentro de um cano escuro, uma lanterna acende e acerta a mão erguida com o anel de sinete. | NOVO | clique da lanterna |
| P-03 | 1 | Corte seco para preto. | — | a voz da menina, uma nota |

### Arco 1: a ditadura surge (5–46,5 s)

| # | Dur. | Plano | Origem | Som |
|---|---|---|---|---|
| 1-01 | 2,5 | A cidade antes dele: ônibus em chamas, loja saqueada, fumaça entre os prédios. | NOVO | sirenes |
| 1-02 | 2 | Sala pobre à noite: o pai e a menina, com uma fita vermelha no cabelo, diante da TV. Ele segura a mão dela. | NOVO | chiado da TV; o coral começa |
| 1-03 | 2,5 | *PROMETEU ORDEM.* | TXT | coral |
| 1-04 | 3 | A sacada: a praça lotada aplaude, com confete. | ♻ (5-02) | aplauso sob o coral |
| 1-05 | 2,5 | Num palanque abaixo da sacada, o coral infantil de uniforme canta. A câmera para na menina da fita vermelha, que canta com os olhos brilhando. | NOVO | coral em primeiro plano |
| 1-06 | 2 | O anel lacra um decreto na cera vermelha. | ♻ (5-03) | batida do lacre no tempo do coral |
| 1-07 | 1,5 | Um decreto lacrado é posto sobre uma pilha que já é alta. | NOVO | batida do lacre |
| 1-08 | 1,5 | O tribunal vazio. | ♻ (5-04) | |
| 1-09 | 1,5 | O portão do Congresso acorrentado. | ♻ (5-05) | corrente |
| 1-10 | 1,5 | Outro lacre (outro trecho de 5-03). | ♻ (5-03) | batida do lacre |
| 1-11 | 2,5 | A estátua colossal contra o sol. | ♻ (5-06) | coral no auge |
| 1-12 | 2 | Operários penduram estandartes enormes com o brasão do anel nas fachadas da avenida. | NOVO | |
| 1-13 | 2,5 | *EXIGIU SILÊNCIO.* | TXT | o coral corta; o órgão entra |
| 1-14 | 2 | A coroa desce até a câmera. | ♻ (5-07c) | órgão |
| 1-15 | 1 | A fileira de dignitários se ajoelha ao mesmo tempo. | NOVO (refaz 5-07e) | órgão |
| 1-16 | 1,5 | Noite: a porta da casa é arrombada e homens de sobretudo arrastam o pai. | NOVO | |
| 1-17 | 2 | Debaixo da mesa, a menina assiste; a fita cai do cabelo dela. | NOVO | |
| 1-18 | 1 | O ditador coroado, de costas, diante do altar. | ♻ (5-07a) | órgão |
| 1-19 | 1 | O paredão: os presos caem e o sangue mancha o muro. | ♻ (5-07b) | rajada |
| 1-20 | 1 | A cela com o rastro de sangue. | ♻ (5-07f) | porta de cela |
| 1-21 | 2,5 | Câmera lenta, na chuva: a polícia atira num protesto, um jovem cai e o sangue escorre para o bueiro. | NOVO (refaz 5-07d) | o órgão para; só chuva |
| 1-22 | 2 | A mão pequena da menina recolhe a fita vermelha do chão, entre cacos de vidro. | NOVO | chuva |

### Arco 2: a revolução começa (46,5–84 s)

| # | Dur. | Plano | Origem | Som |
|---|---|---|---|---|
| 2-01 | 3 | *ESQUECEU QUE AS CRIANÇAS CRESCEM.* | TXT | silêncio, depois o hino distorcido |
| 2-02 | 2,5 | Anos depois, outra cerimônia na praça. Fileiras de jovens de uniforme cantam. Ela, com uns 17 anos, está de boca fechada, com a fita amarrada no pulso. | NOVO | hino distorcido |
| 2-03 | 2 | Fila de pão que dobra o quarteirão; prateleiras vazias. | NOVO | |
| 2-04 | 1,5 | O portão de uma fábrica acorrentado, com operários parados do lado de fora (rima com 1-09). | NOVO PX | corrente |
| 2-05 | 2 | Noite: velas acesas nas janelas de um prédio inteiro. | NOVO | |
| 2-06 | 2,5 | Fitas vermelhas passam de mão em mão e são amarradas de pulso em pulso. | NOVO | uma segunda voz |
| 2-07 | 2 | Da janela do palácio, a mão com o anel afasta a cortina; lá embaixo, velas e pulsos vermelhos na multidão. | NOVO | |
| 2-08 | 1,5 | A caneta do ditador falha no papel; a mão com o anel a sacode. | NOVO | caneta arranhando |
| 2-09 | 2 | Num porão, jovens de fita no pulso dividem fuzis velhos; ela amarra a fita no pulso de um deles. | NOVO | |
| 2-10 | 3 | Barricada: ela caminha até um soldado jovem e amarra a fita no cano do fuzil dele. Ele abaixa a arma. | NOVO | o coro cresce |
| 2-11 | 1,5 | Outros soldados abaixam as armas, um a um. | NOVO | |
| 2-12 | 2 | Um quartel vazio; o telefone toca e ninguém atende. | NOVO PX | telefone |
| 2-13 | 3 | A sacada cinza, a praça em silêncio, as mãos apertam a balaustrada. | ♻ (5-09a) | silêncio |
| 2-14 | 3 | Na praça, close dela: começa a cantar o hino sozinha, em tom menor. | NOVO | a voz dela, sozinha |
| 2-15 | 2 | Ao redor dela, outras pessoas cantam; a câmera abre e a praça inteira canta. | NOVO | a multidão canta |
| 2-16 | 2 | O canto vira vaia; uma pedra voa contra a câmera; as mãos recuam da balaustrada. | NOVO (refaz 5-09b) | vaia |
| 2-17 | 2 | De dentro, a cortina da sacada se fecha e o salão fica escuro. | NOVO | o canto abafado lá fora |

### Arco 3: a queda (84–106,5 s)

Cada plano desfaz um símbolo do Arco 1.

| # | Dur. | Plano | Desfaz | Origem | Som |
|---|---|---|---|---|---|
| 3-01 | 2 | A estátua colossal tomba, puxada por cordas pela multidão; a cabeça se parte no chão. | 1-11 | NOVO | canto de guerra, tambores, estrondo |
| 3-02 | 1 | O caminhão arrebenta o portão; rebeldes correm. | 1-09 | ♻ (5-10a) | impacto |
| 3-03 | 1 | Os estandartes do brasão são rasgados das fachadas e caem em chamas. | 1-12 | NOVO | |
| 3-04 | 1 | No tribunal, o brasão é arrancado da parede e cai. | 1-08 | NOVO | |
| 3-05 | 1,5 | O salão do palácio: um guarda baleado no mármore; rebeldes avançam pela fumaça. | | ♻ (5-10b) | tiros |
| 3-06 | 1,5 | A pilha de decretos queima na lareira; a cera vermelha escorre. | 1-07 | NOVO | fogo |
| 3-07 | 1 | No salão vazio, a coroa cai de uma almofada e rola pelo mármore; botas passam por cima. | 1-14 | NOVO | |
| 3-08 | 1 | O gabinete saqueado. | | ♻ (5-14) | |
| 3-09 | 2,5 | Em primeira pessoa, no heliponto do telhado, à noite: céu vazio e vento, ninguém vem buscá-lo. A mão com o anel aperta o corrimão. | 1-04 | NOVO | o canto ao longe, vento |
| 3-10 | 1,5 | A fuga pelo túnel, com a mão do anel na parede. | | ♻ (5-10c) | respiração |
| 3-11 | 3 | O cano: as lanternas entram e os rebeldes avançam. É o plano do prólogo, agora visto inteiro. | | ♻ (5-11) | gritos |
| 3-12 | 1,5 | Close: uma mão com a fita vermelha no pulso arranca o anel do dedo do ditador. | 1-06 | NOVO | |
| 3-13 | 1 | O clarão do disparo. | | ♻ (5-12) | tiro |
| 3-14 | 3 | Preto. | | — | silêncio total |

### Coda (106,5–123 s)

| # | Dur. | Plano | Origem | Som |
|---|---|---|---|---|
| C-01 | 3 | Dia, a praça: o corpo pendurado, com o rosto escondido. | ♻ (5-13) | sinos, burburinho |
| C-02 | 2,5 | Ela entra sozinha no gabinete vazio, abre a mão, olha o anel e o põe no dedo. | NOVO | sinos ao longe |
| C-03 | 3,5 | A sacada vista de baixo, ao entardecer dourado: ela, de costas, ergue a mão com o anel e a fita no pulso. A praça aplaude e cai confete. | NOVO (espelho de 5-02) | o coral infantil volta, em tom maior |
| C-04 | 2 | O anel lacra um decreto novo na cera vermelha. | ♻ (5-03), o mesmo clipe de 1-06 | batida do lacre |
| C-05 | 1,5 | Preto. | — | caneta assinando |
| C-06 | 4 | Frame final: *NINGUÉM NASCE TIRANO. BASTA UM DECRETO.* e **DECRETO**. | ♻ (fim-frame-final) | golpe grave |

## Produção

- **Reaproveitados da v0:** 17 clipes (5-02, 5-03, 5-04, 5-05, 5-06, 5-07a, 5-07b, 5-07c, 5-07f, 5-09a, 5-10a,
  5-10b, 5-10c, 5-11, 5-12, 5-13, 5-14) e o frame final.
- **Saem da v0:** a abertura com o monitor (a2), o clique no mouse (5-01), o teclado na luz vermelha (5-08) e todas
  as telas do jogo, incluindo a cascata com DERROTA.
- **Novos no ComfyUI:** 35 planos. São 33 com o Wan, cerca de 12 a 14 h de lote no Mac, e 2 em parallax (2-04 e
  2-12). Proponho rodar em três noites, na ordem dos arcos, revisando cada arco antes do seguinte.
- **Primeiro passo:** antes de qualquer plano, gerar as imagens de referência da menina aos 9 e aos 17 anos, para
  você aprovar.
- **Comigo:** os 4 intertítulos (em português e em inglês), a melodia e a letra do hino, a montagem no FilmCraft e a
  versão em inglês, que muda só os intertítulos.
- **Continuidade da menina:** o SDXL não mantém o mesmo rosto de um plano para outro. Ela é reconhecida pela fita
  vermelha e pelo cabelo, com só três closes de rosto (1-17, 2-02 e 2-14). Para esses três, uso o IP-Adapter comum,
  que parte de uma imagem de referência. As ferramentas de rosto baseadas no InsightFace (FaceID, InstantID, PuLID)
  ficam de fora, porque os modelos dele não permitem uso comercial. Se o IP-Adapter não estiver instalado no Mac,
  peço antes de baixar.
- **Fila do ComfyUI:** o trailer v3 só usa o ComfyUI depois deste, como você pediu, então ele espera esses três
  lotes.

## Riscos

1. **Gestos pequenos e precisos** são o tipo de coisa que o Wan erra. Os principais são:
   - a fita amarrada no cano do fuzil (2-10);
   - a mão que arranca o anel (3-12);
   - o anel posto no dedo (C-02).

   O plano B é parallax sobre uma imagem bem retocada.
2. **Dois minutos é longo para um trailer.** O Arco 2 é o trecho com mais risco de cansar: o ritmo é de montagem
   curta e não há uma imagem de choque. Quem segura o arco é a voz dela. Se a montagem sentir o peso, os primeiros
   cortes candidatos são 2-04, 2-05 e 2-12 (−5,5 s).
3. **A voz dela na praça é o ponto crítico da trilha.** Uma voz sintetizada cantando sozinha, em close, pode soar
   falsa. Para reduzir o risco, a voz é gerada antes dos planos 2-14 e 2-15, para você ouvir, e o plano 2-14 é
   montado no tempo dela.

## Nota

- **O roteiro, como texto: 9/10.** Tem causa, uma personagem com começo, meio e fim, e um final que muda o sentido
  de tudo o que veio antes.
- **O que eu espero do vídeo pronto: 7,5 a 8/10.** Os limites são a resolução dos clipes locais (832x480
  ampliados), a continuidade da menina em duas idades e a voz cantada.
