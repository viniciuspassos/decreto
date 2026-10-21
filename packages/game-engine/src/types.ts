import type { LevelIndicatorId, TaxRate } from "@decreto/game-content";
import type { GameState, RiskId } from "@decreto/shared-types";

export interface PendingChoice {
  eventId: string;
  turn: number;
}

export type Defeat = "coup" | "attack" | "revolution";

/**
 * Complete server-side game state: the `GameState` seen by the UI plus engine-only data
 * (seed, indicator baselines, cooldowns...). `indicators` stores displayed values; `debt` is a stock.
 */
export interface EngineState extends GameState {
  /** Estado do RNG (mulberry32). Nunca enviado ao cliente. */
  seed: number;
  /** Current tax rate: `taxes-X` is active ⇔ `taxRate ≥ X` (game-design §1.4). */
  taxRate: TaxRate;
  /** Tax rate adjustment in the turn queue (counts as 1 action), or `null`. */
  queuedTaxRate: TaxRate | null;
  /** "Country without policies" (§1.2) and its value one semester earlier (momentum, §3.1). */
  base: Record<LevelIndicatorId, number>;
  previousBase: Record<LevelIndicatorId, number>;
  /** 0 a 3 (§3.4). */
  recessionLevel: number;
  turnsInPower: number;
  /** Consecutive terms, for government wear on the support anchor (§3.5). */
  termsInRow: number;
  /** Current turn crisis flag (§3.9) and last turn with a crisis event. */
  crisis: boolean;
  lastCrisisTurn: number | null;
  /** Temporary media and military score modifiers; decay by 50% per semester (§4.5). */
  moodMods: { media: number; military: number };
  /** Last turn each drawn event occurred (cooldown, §4.3). */
  eventTurns: Record<string, number>;
  lastPositiveEventTurn: number | null;
  rebelsEmerged: boolean;
  /** Event choices to resolve at the start of the turn (§4.4). */
  pendingChoices: PendingChoice[];
  /** Risks added only to the next roll (`risks` effects from events and choices). */
  eventRisks: Partial<Record<RiskId, number>>;
  /** Honeymoon for the current semester (S3); activated by the election. */
  honeymoon: boolean;
  defeat: Defeat | null;
}
