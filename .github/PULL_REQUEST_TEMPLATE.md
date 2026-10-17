## Descrição

<!-- Resuma o que esta PR faz e por quê. Se corrige/implementa algo descrito no roteiro
(`roteiro-do-jogo.md`), aponte a seção (ex.: S3, S6). -->

## Tipo de mudança

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `docs` — documentação
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] `test` — testes
- [ ] `build` / `ci` / `chore` — infraestrutura, build ou tarefas de manutenção

## Issue relacionada

Closes #

## Checklist

- [ ] Segui as convenções do `CLAUDE.md` do projeto e, quando aplicável, do roteiro
      (`roteiro-do-jogo.md`)
- [ ] Dados de conteúdo (árvores, grupos, regimes, etc.) ficam em módulos de dados,
      não hard-coded em UI/motor
- [ ] Strings visíveis ao jogador passam por chave de i18n (pt-BR/en); "Decreto" não foi
      traduzido
- [ ] Testes novos/atualizados cobrem a mudança (TDD: teste antes do código)
- [ ] `typecheck`, `lint` e `test` passam localmente
- [ ] Nenhum segredo (token, chave, `.env`) foi commitado

## Como testar

<!-- Passos para validar manualmente a mudança, se aplicável. -->
