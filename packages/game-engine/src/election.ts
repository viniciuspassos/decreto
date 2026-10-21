import { BROKEN_PROMISE_PENALTY, HONEYMOON, POLICY_REACTION, TURNS_PER_TERM } from "@decreto/game-content";
import type { CampaignPromise, GroupState } from "@decreto/shared-types";
import { nodeStatus } from "./availability.js";
import type { SemesterContent } from "./content.js";
import { clamp } from "./semester/common.js";
import { endSemester } from "./semester/endSemester.js";
import { isElectionDue } from "./semester/term.js";
import { approvalOf, loyaltyOf } from "./semester/groups.js";
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

/** One option per field (except Power, which is a regime): the next available node across the field's trees. */
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

function ballotPromises(state: EngineState, nodeIds: string[], content: SemesterContent): CampaignPromise[] {
  const campaign = state.campaignPromises;
  if (!campaign) return validPromises(state, nodeIds, content);
  if (nodeIds.length !== campaign.length || nodeIds.some((id, index) => id !== campaign[index])) throw new Error("promises differ from final-turn campaign");
  return campaign.map((id) => promiseFor(id, content));
}

const countFor = (promises: CampaignPromise[], key: "gains" | "loses", groupId: string) =>
  promises.filter((p) => p[key].includes(groupId)).length;

/** Ballot support: broken term promises cost support from groups that liked them; new promises excite and alienate groups. */
function ballotGroups(state: EngineState, promises: CampaignPromise[], content: SemesterContent): GroupState[] {
  const broken = state.promises.filter((n) => !state.activeNodes.includes(n)).map((n) => promiseFor(n, content));
  return state.groups.map((g) => {
    if (g.support === null) return g;
    const delta = POLICY_REACTION * (countFor(promises, "gains", g.id) - countFor(promises, "loses", g.id))
      - BROKEN_PROMISE_PENALTY * countFor(broken, "gains", g.id);
    const support = clamp(g.support + delta, 0, 100);
    return { ...g, support, loyalty: loyaltyOf(support) };
  });
}

/** Projected votes (weighted support %) for the selected promises, without changing the state. */
export function projectVotes(state: EngineState, nodeIds: string[], content: SemesterContent): number {
  return approvalOf(ballotGroups(state, ballotPromises(state, nodeIds, content), content));
}

/** The next government (AI) runs a term without a queue and without changing the player's nodes; ending it is not a player defeat. */
function opposition(state: EngineState, content: SemesterContent): EngineState {
  const away = Array.from({ length: TURNS_PER_TERM }).reduce<EngineState>(
    (current) => ({ ...endSemester(current, content).state, defeat: null }), state,
  );
  // AI government events and crises do not carry over to the player; no consecutive term on return.
  return { ...away, capital: state.capital, turnsInPower: 0, term: state.term + 1, termsInRow: 0, pendingChoices: [], crisis: false };
}

/**
 * End-of-term election (design §7). Win with more than 50% support; a margin ≥ 20 (`2×support − 100`)
 * triggers the honeymoon. Losing advances one full term under AI government; the player can run again.
 */
export function runElection(state: EngineState, nodeIds: string[], content: SemesterContent): ElectionResult {
  if (state.defeat || !isElectionDue(state)) throw new Error("no election due");
  const groups = ballotGroups(state, ballotPromises(state, nodeIds, content), content);
  const approval = approvalOf(groups);
  const margin = 2 * approval - 100;
  const won = margin > 0;
  const voted = { ...state, groups, approval, history: [...state.history, { term: state.term, inPower: won }] };
  if (!won) return { state: opposition({ ...voted, promises: [], campaignPromises: undefined, queue: [], queuedTaxRate: null }, content), won };
  const next = { ...voted, promises: nodeIds, campaignPromises: undefined, term: state.term + 1, termsInRow: state.termsInRow + 1 };
  return { state: { ...next, honeymoon: margin >= HONEYMOON.minMargin }, won };
}
