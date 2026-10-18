/**
 * Constantes de regra (roteiro §2–§3) e parâmetros de custo/turno usados pelo motor
 * (`packages/game-engine`). Só números — nenhuma fórmula vive aqui.
 */

/** Ações disponíveis por turno (semestre), antes de qualquer desconto. */
export const MAX_ACTIONS = 6;
export const TURNS_PER_TERM = 8;
/** Mandatos seguidos no poder para vencer por tempo (20 anos). */
export const TERMS_TO_WIN = 5;
/** Turno em que a partida termina sem vitória (40 anos). */
export const LAST_TURN = 80;
/** Abaixo desta aprovação, risco de golpe vira derrota (ver `game-design` §3.7). */
export const COUP_APPROVAL = 15;

/** S3: custo = base × (1 + profundidade × peso maior + distância × peso menor). */
export const CAPITAL_COST_WEIGHTS = {
  base: 10,
  depth: 1,
  distance: 0.4,
} as const;

/** Lua de mel: margem de vitória grande desconta as primeiras ações do mandato pela metade. */
export const HONEYMOON = {
  minMargin: 20,
  discountedActions: 2,
  discount: 0.5,
} as const;

/** Desconto de custo em crise, só nos campos de Segurança e Poder (S3). */
export const CRISIS_DISCOUNT = {
  fields: ["security", "power"] as const,
  discount: 0.3,
} as const;

/** Alíquotas possíveis da árvore de intensidade `taxes` (game-design §1.4). */
export const TAX_RATES = [0, 10, 20, 30, 40, 50, 60, 70] as const;
export type TaxRate = (typeof TAX_RATES)[number];

/** Custo de mudar `taxRate`: `10 × (1 + salto em faixas de 10%)`. */
export const TAX_STEP_COST_BASE = 10;

/** Partida nova: capital e apoio de cada grupo não emergente ao tomar posse. */
export const INITIAL_CAPITAL = 60;
export const INITIAL_SUPPORT = 50;
/** Capital ganho por semestre = aprovação × este fator (roteiro §4.21: só a aprovação conta). */
export const CAPITAL_PER_APPROVAL = 0.5;
/** Reação de grupo por ação de política que ele gosta (+) ou não gosta (−). */
export const POLICY_REACTION = 4;
