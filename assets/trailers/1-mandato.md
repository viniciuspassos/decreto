# Trailer 1: "Mandato"

Roteiro do miolo (10–55 s). Linguagem comum, abertura (A1–A3), encerramento (E1) e produção em
[comum.md](comum.md). Trilha e som em [1-mandato.trilha.md](1-mandato.trilha.md).

Final democrático. O poder cresce pela **aprovação**: as multidões aumentam a cada eleição e o
jogador envelhece, mas **nada diz que é o final feliz**. Cada escolha agrada um grupo e custa outro,
e isso aparece na imagem, não em texto. O gancho final: no 19º ano, com a aprovação caindo e a
eleição chegando — e 20 anos seguidos seriam a vitória —, o democrata está **a um clique** de virar
tirano.

**Recurso de tempo:** as mãos envelhecem de plano em plano (pele, relógio trocado, manchas da
idade). A aliança aparece em destaque no 1-02a, reaparece no 1-07 e some no 1-09. Sem cartelas, a
passagem dos mandatos fica por conta das mãos e do tamanho das multidões.

**Duração por clipe:** cada clipe de IA sai da geração com 2 s e vira sempre 3 s na câmera lenta de
pós-produção (ver [estrutura de roteiro e manifest](producao.md#roteiro-e-manifest-de-cada-trailer))
— não existe clipe de 4 s ou 5 s. Todo plano de "1 gesto só" dura portanto exatamente 3 s; planos com
mais de uma cena são dois ou mais clipes encadeados por corte na edição, nunca uma transição dentro
do mesmo clipe (ex.: nada de mapa mudando de cor sozinho — risco real de o modelo render isso como
bandeira). A montagem 1-08 usa a técnica inversa: gera-se cada clipe inteiro de 3 s e corta-se na
edição para sobrar só 1 s de cada. Os prompts de cada clipe ficam em
[`1-mandato.manifest.json`](1-mandato.manifest.json).

| # | Tipo | Tempo | Plano | Interface |
|---|---|---|---|---|
| 1-01 | clip | 3 s | Corte: luzes quentes de um corredor de hospital se acendem, uma a uma, no escuro — alívio, não ameaça. | Nó **Ampliação da rede pública** acende |
| 1-02a | clip | 3 s | Close na mão no mouse: **aliança e relógio** bem visíveis. Clique. | — |
| 1-02b | clip | 3 s | Corte, plano frontal estático: uma sala de aula lotada, gente de pé no fundo. | Nó **Universidade gratuita** acende |
| 1-03a | clip | 3 s | Câmera leve na mão: noite de eleição, bar lotado, pessoas de pé olhando a TV. | — |
| 1-03b | clip | 3 s | Corte seco: explosão de confete e comemoração. | — |
| 1-04 | clip | 3 s | Mãos (mais velhas, relógio novo) no mouse; no monitor, um alerta vermelho pisca. | Apoio de um grupo sobe, o de outro desce; alerta de **inflação** |
| 1-05a | clip | 3 s | Clique. Corte: turbinas eólicas girando ao nascer do sol. | Nó **Metas de emissão** acende |
| 1-05b | clip | 3 s | Corte seco: portão de fábrica fechando, um operário de **uniforme laranja** parado olhando. | — |
| 1-06 | clip | 3 s | Protesto pacífico na chuva, visto da janela do gabinete; os manifestantes vestem o **mesmo uniforme laranja**. | — |
| 1-07 | clip | 3 s | 2ª eleição em 1ª pessoa, do palanque: mão mais velha no púlpito, **aliança ainda visível**, praça maior. | — |
| 1-08a | clip | 1 s | Montagem: 3ª eleição, mesmo enquadramento do palanque, confete. | — |
| 1-08b | clip | 1 s | Montagem: 4ª eleição, mão mais velha, multidão maior, confete. | — |
| 1-08c | clip | 1 s | Montagem: 5ª eleição, mão ainda mais velha, multidão maior, confete. | — |
| 1-09 | clip | 3 s | Mãos idosas, trêmulas, **sem a aliança**, sobre a mesa. | Grafo quase todo aceso; contador em **Ano 20**; **Eleição: próximo turno**; aprovação em vermelho, caindo |
| 1-10a | clip | 3 s | Silêncio, só chuva. O cursor desliza até perto do último nó apagado. | Único nó cinza: **Reeleição ilimitada** |
| 1-10b | clip | 3 s | Cursor chega e para sobre o nó, leve tremor na mão. | idem |
| 1-10c | clip | 3 s | Close no dedo pairando sobre o botão do mouse… corte para preto antes do clique. | idem |
| | | **45 s** | → Encerramento compartilhado | |

Clipes de IA: 17 (1-02, 1-03 e 1-05 têm 2 clipes cada; 1-10 tem 3; a montagem 1-08 tem 3, de 1 s cada).
