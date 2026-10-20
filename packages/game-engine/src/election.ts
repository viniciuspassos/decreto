import { BROKEN_PROMISE_PENALTY, HONEYMOON, POLICY_REACTION, TURNS_PER_TERM } from "@decreto/game-content";
import type { CampaignPromise, GroupState } from "@decreto/shared-types";
import { nodeStatus } from "./availability.js";
import type { SemesterContent } from "./content.js";
import { clamp } from "./semester/common.js";
import { endSemester } from "./semester/endSemester.js";
import { approvalOf } from "./semester/groups.js";
import { treeOf } from "./trees.js";
import type { EngineState } from "./types.js";

export interface ElectionResult {
  state: EngineState;
  won: boolean;
}

function promiseFor(nodeId: string, content: SemesterContent): CampaignPromise {
  const treeId = treeOf(nodeId, content)?.id ?? "";
  const groupsWhere = (key: "likes" | "dislikes") => content.voterGroups.filter((g) => g[key].includes(treeId)).map((g) => g.id);
  return { nodeId, gains: groupsWhere("likes"), loses: groupsWhere("dislikes") };
}

/** Uma opção por campo (exceto Poder, que é regime): o próximo nó disponível entre as árvores do campo. */
export function campaignOptions(state: EngineState, content: SemesterContent): CampaignPromise[] {
  const fields = [...new Set(content.policyTrees.map((t) => t.field))].filter((f) => f !== "power");
  return fields.flatMap((field) => {
    const nodes = content.policyTrees.filter((t) => t.field === field && !t.intensity).flatMap((t) => t.nodes);
    const next = nodes.find((n) => nodeStatus(n, { state, content }) === "available");
    return next ? [promiseFor(next, content)] : [];
  });
}

function validPromises(state: EngineState, nodeIds: string[], content: SemesterContent): CampaignPromise[] {
  const options = campaignOptions(state, content);
  const promises = nodeIds.map((id) => options.find((o) => o.nodeId === id));
  if (promises.some((p) => p === undefined) || new Set(nodeIds).size !== nodeIds.length) throw new Error("invalid promises");
  return promises as CampaignPromise[];
}

const countFor = (promises: CampaignPromise[], key: "gains" | "loses", groupId: string) =>
  promises.filter((p) => p[key].includes(groupId)).length;

/** Apoio na urna: as promessas do mandato não cumpridas cobram dos grupos que gostaram; as novas animam e afastam. */
function ballotGroups(state: EngineState, promises: CampaignPromise[], content: SemesterContent): GroupState[] {
  const broken = state.promises.filter((n) => !state.activeNodes.includes(n)).map((n) => promiseFor(n, content));
  return state.groups.map((g) => {
    if (g.support === null) return g;
    const delta = POLICY_REACTION * (countFor(promises, "gains", g.id) - countFor(promises, "loses", g.id))
      - BROKEN_PROMISE_PENALTY * countFor(broken, "gains", g.id);
    return { ...g, support: clamp(g.support + delta, 0, 100) };
  });
}

/** Votos projetados (% de apoio ponderado) para as promessas escolhidas, sem alterar o estado. */
export function projectVotes(state: EngineState, nodeIds: string[], content: SemesterContent): number {
  return approvalOf(ballotGroups(state, validPromises(state, nodeIds, content), content));
}

/** O governo seguinte (IA) roda um mandato sem fila e sem tocar nos nós do jogador; derrubá-lo não é derrota do jogador. */
function opposition(state: EngineState, content: SemesterContent): EngineState {
  const away = Array.from({ length: TURNS_PER_TERM }).reduce<EngineState>(
    (current) => ({ ...endSemester(current, content).state, defeat: null }), { ...state, termsInRow: 0 },
  );
  return { ...away, capital: state.capital, turnsInPower: 0, term: state.term + 1 };
}

/**
 * Eleição de fim de mandato (roteiro §7). Vence com mais de 50% de apoio; margem ≥ 20 (`2×apoio − 100`)
 * ativa a lua de mel. Perder avança um mandato inteiro sob o governo da IA; o jogador pode concorrer de novo.
 */
export function runElection(state: EngineState, nodeIds: string[], content: SemesterContent): ElectionResult {
  const groups = ballotGroups(state, validPromises(state, nodeIds, content), content);
  const approval = approvalOf(groups);
  const margin = 2 * approval - 100;
  const won = margin > 0;
  const voted = { ...state, groups, approval, history: [...state.history, { term: state.term, inPower: won }] };
  if (!won) return { state: opposition({ ...voted, promises: [], queue: [], queuedTaxRate: null }, content), won };
  const next = { ...voted, promises: nodeIds, term: state.term + 1, termsInRow: state.termsInRow + 1 };
  return { state: { ...next, honeymoon: margin >= HONEYMOON.minMargin }, won };
}
