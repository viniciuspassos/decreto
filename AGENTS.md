# Instruções para agentes

## Início de feature ou planejamento

Antes de implementar uma feature ou elaborar um plano, sempre faça checkout da branch `main`
e valide que ela está atualizada com `origin/main` (`git fetch origin main` seguido de
`git pull --ff-only`). Pare e peça orientação se não puder atualizar por fast-forward.

## Review antes de pull request

Antes de abrir um pull request, invoque um subagente para revisar o diff da branch.
Corrija todos os apontamentos de severidade alta ou média antes de abrir o pull
request. Para cada apontamento de severidade baixa, crie uma issue no repositório.
