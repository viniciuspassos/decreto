import {
  EXCLUSIVE_NODE_PAIRS, EXTRA_PREREQS, events, nodeEffects, nodeFigures, policyTrees, systemEvents, taxRateEffects, voterGroups,
  type GameEventDefinition, type NodeEffect, type SystemEventDefinition, type TaxRate, type VoterGroup,
} from "@decreto/game-content";
import type { GameContent } from "./trees.js";

/** Catalogs consulted by the semester, injected as `GameContent` (see `trees.ts`). */
export interface SemesterContent extends GameContent {
  voterGroups: VoterGroup[];
  nodeEffects: Record<string, NodeEffect>;
  taxRateEffects: Record<TaxRate, NodeEffect>;
  events: GameEventDefinition[];
  systemEvents: SystemEventDefinition[];
  nodeFigures: Record<string, string>;
}

/** The actual game content from `@decreto/game-content`. */
export const defaultContent: SemesterContent = {
  policyTrees, extraPrereqs: EXTRA_PREREQS, exclusiveNodePairs: EXCLUSIVE_NODE_PAIRS,
  voterGroups, nodeEffects, taxRateEffects, events, systemEvents, nodeFigures,
};
