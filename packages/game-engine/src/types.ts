import type { LevelIndicatorId, TaxRate } from "@decreto/game-content";
import type { GameState, RiskId } from "@decreto/shared-types";

export interface PendingChoice {
  eventId: string;
  turn: number;
}

export type Defeat = "coup" | "attack" | "revolution";

/**
 * Estado completo da partida no servidor: o `GameState` que a UI vê + o que só o motor usa
 * (seed, base dos indicadores, cooldowns...). `indicators` guarda os valores exibidos; `debt` é estoque.
 */
export interface EngineState extends GameState {
  /** Estado do RNG (mulberry32). Nunca enviado ao cliente. */
  seed: number;
  /** Alíquota corrente: `taxes-X` está ativo ⇔ `taxRate ≥ X` (game-design §1.4). */
  taxRate: TaxRate;
  /** Ajuste de alíquota na fila do turno (conta como 1 ação), ou `null`. */
  queuedTaxRate: TaxRate | null;
  /** "País sem as políticas" (§1.2) e seu valor um semestre antes (momento, §3.1). */
  base: Record<LevelIndicatorId, number>;
  previousBase: Record<LevelIndicatorId, number>;
  /** 0 a 3 (§3.4). */
  recessionLevel: number;
  turnsInPower: number;
  /** Mandatos seguidos, para o desgaste de governo na âncora de apoio (§3.5). */
  termsInRow: number;
  /** Flag de crise do turno corrente (§3.9) e último turno com evento de crise. */
  crisis: boolean;
  lastCrisisTurn: number | null;
  /** Modificadores temporários de escore de mídia e militares; decaem 50% por semestre (§4.5). */
  moodMods: { media: number; military: number };
  /** Último turno em que cada evento sorteado saiu (cooldown, §4.3). */
  eventTurns: Record<string, number>;
  lastPositiveEventTurn: number | null;
  rebelsEmerged: boolean;
  /** Escolhas de evento a resolver no início do turno (§4.4). */
  pendingChoices: PendingChoice[];
  /** Riscos somados só à próxima rolagem (efeitos `risks` de eventos e escolhas). */
  eventRisks: Partial<Record<RiskId, number>>;
  /** Lua de mel no semestre corrente (S3); ligada pela eleição. */
  honeymoon: boolean;
  defeat: Defeat | null;
}
