import { ELECTION_SUSPENDING_NODES, TURNS_PER_TERM } from "@decreto/game-content";
import type { EngineState } from "../types.js";

export const termEnded = (state: EngineState) => state.turn > state.term * TURNS_PER_TERM;

const electionsSuspended = (state: EngineState) => ELECTION_SUSPENDING_NODES.some((n) => state.activeNodes.includes(n));

/** Há eleição a disputar: o mandato acabou e nenhum regime a cancelou (roteiro §7, §8). */
export const isElectionDue = (state: EngineState) => termEnded(state) && !electionsSuspended(state);

/** Sem eleição, o mandato vence sozinho: o poder segue e o desgaste de governo continua. */
export function skipElectionIfSuspended(state: EngineState): void {
  if (!termEnded(state) || !electionsSuspended(state)) return;
  state.history.push({ term: state.term, inPower: true });
  state.term += 1;
  state.termsInRow += 1;
}
