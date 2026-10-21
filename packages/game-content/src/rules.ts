/**
 * Rule constants (design §2–§3) and cost/turn parameters used by the engine
 * (`packages/game-engine`). Numbers only; formulas do not live here.
 */

/** Actions available per turn (semester), before any discounts. */
export const MAX_ACTIONS = 6;
export const TURNS_PER_TERM = 8;
/** Consecutive terms in power required to win by time (20 years). */
export const TERMS_TO_WIN = 5;
/** Regime nodes that cancel elections (S4): the term continues without a vote and power is retained (design §8). */
export const ELECTION_SUSPENDING_NODES = ["election-postponement", "end-of-elections"];
/** Turn when the game ends without a win (40 years). */
export const LAST_TURN = 80;
/** Below this approval, coup risk causes a loss (see `game-design` §3.7). */
export const COUP_APPROVAL = 15;

/** S3: cost = base × (1 + depth × higher weight + distance × lower weight). */
export const CAPITAL_COST_WEIGHTS = {
  base: 10,
  depth: 1,
  distance: 0.4,
} as const;

/** Honeymoon: a large victory margin discounts the first actions of the term by half. */
export const HONEYMOON = {
  minMargin: 20,
  discountedActions: 2,
  discount: 0.5,
} as const;

/** Crisis cost discount, only for the Security and Power fields (S3). */
export const CRISIS_DISCOUNT = {
  fields: ["security", "power"] as const,
  discount: 0.3,
} as const;

/** Possible rates for the `taxes` intensity tree (game-design §1.4). */
export const TAX_RATES = [0, 10, 20, 30, 40, 50, 60, 70] as const;
export type TaxRate = (typeof TAX_RATES)[number];

/** Cost to change `taxRate`: `10 × (1 + number of 10% brackets crossed)`. */
export const TAX_STEP_COST_BASE = 10;

/** New game: starting capital and support for each non-emergent group upon taking office. */
export const INITIAL_CAPITAL = 60;
export const INITIAL_SUPPORT = 50;
/** Capital earned per semester = approval × this factor (design §4.21: approval is the only factor). */
export const CAPITAL_PER_APPROVAL = 0.5;
/** Support lost by groups that liked an unfulfilled campaign promise (design §7). */
export const BROKEN_PROMISE_PENALTY = 6;
/** Group reaction per policy action they like (+) or dislike (−). */
export const POLICY_REACTION = 4;
