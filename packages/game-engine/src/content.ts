import {
  EXCLUSIVE_NODE_PAIRS, EXTRA_PREREQS, events, nodeEffects, policyTrees, systemEvents, taxRateEffects, voterGroups,
  type GameEventDefinition, type NodeEffect, type SystemEventDefinition, type TaxRate, type VoterGroup,
} from "@decreto/game-content";
import type { GameContent } from "./trees.js";

/** Catálogos que o semestre consulta, injetados como `GameContent` (ver `trees.ts`). */
export interface SemesterContent extends GameContent {
  voterGroups: VoterGroup[];
  nodeEffects: Record<string, NodeEffect>;
  taxRateEffects: Record<TaxRate, NodeEffect>;
  events: GameEventDefinition[];
  systemEvents: SystemEventDefinition[];
}

/** O conteúdo real do jogo, de `@decreto/game-content`. */
export const defaultContent: SemesterContent = {
  policyTrees, extraPrereqs: EXTRA_PREREQS, exclusiveNodePairs: EXCLUSIVE_NODE_PAIRS,
  voterGroups, nodeEffects, taxRateEffects, events, systemEvents,
};
