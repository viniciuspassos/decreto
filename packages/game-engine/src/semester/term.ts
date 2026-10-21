import { ELECTION_SUSPENDING_NODES, TURNS_PER_TERM } from "@decreto/game-content";
import type { EngineState } from "../types.js";

export const termEnded = (state: EngineState) => state.turn > state.term * TURNS_PER_TERM;

/** Campaign begins after the final semester, when the term's election becomes due. */
export const isCampaignDue = (state: EngineState) => termEnded(state) && !electionsSuspended(state);

const electionsSuspended = (state: EngineState) => ELECTION_SUSPENDING_NODES.some((n) => state.activeNodes.includes(n));

/** An election is pending: the term ended and no regime canceled it (design §7, §8). */
export const isElectionDue = (state: EngineState) => termEnded(state) && !electionsSuspended(state);

/** Without an election, the term expires automatically: power continues and government wear continues. */
export function skipElectionIfSuspended(state: EngineState): void {
  if (!termEnded(state) || !electionsSuspended(state)) return;
  state.history.push({ term: state.term, inPower: true });
  state.term += 1;
  state.termsInRow += 1;
  state.campaignPromises = undefined;
}
