import {
  BASE_INDICATORS, INITIAL_CAPITAL, INITIAL_SUPPORT, INITIAL_TAX_RATE, LEVEL_INDICATORS, SITUATIONS, type LevelIndicatorId,
} from "@decreto/game-content";
import type { GroupState, InitialSituation } from "@decreto/shared-types";
import type { SemesterContent } from "./content.js";
import { updateMoods } from "./semester/actors.js";
import { capitalGain } from "./semester/endSemester.js";
import { approvalOf, loyaltyOf } from "./semester/groups.js";
import type { EngineState } from "./types.js";

export interface NewGameOptions {
  country: string;
  president: string;
  situation: InitialSituation;
  /** Game RNG seed (stored on the server). */
  seed: number;
}

/** New game (design §1.5): on turn 1, the baseline is the displayed value and momentum is zero. */
export function newGame(options: NewGameOptions, content: SemesterContent): EngineState {
  const indicators = { ...BASE_INDICATORS, ...SITUATIONS[options.situation] };
  const base = Object.fromEntries(LEVEL_INDICATORS.map((id) => [id, indicators[id]])) as Record<LevelIndicatorId, number>;
  const groups: GroupState[] = content.voterGroups.map((g) => {
    const support = g.emergent ? null : INITIAL_SUPPORT;
    return { id: g.id, size: g.initialSize, support, delta: 0, loyalty: loyaltyOf(support), memory: null };
  });
  const approval = approvalOf(groups);
  const state: EngineState = {
    country: options.country, president: options.president, turn: 1, term: 1, approval,
    capital: INITIAL_CAPITAL, capitalPerTurn: capitalGain(approval), activeNodes: [], queue: [], indicators, groups,
    actors: { media: "neutral", military: "neutral" }, promises: [], history: [],
    seed: options.seed >>> 0, taxRate: INITIAL_TAX_RATE, queuedTaxRate: null, base, previousBase: { ...base },
    recessionLevel: 0, turnsInPower: 0, termsInRow: 1, crisis: false, lastCrisisTurn: null,
    moodMods: { media: 0, military: 0 }, eventTurns: {}, lastPositiveEventTurn: null, rebelsEmerged: false,
    pendingChoices: [], eventRisks: {}, honeymoon: false, defeat: null,
  };
  updateMoods({ state, content });
  return state;
}
