import { defaultContent } from "./content.js";
import { checkEnd } from "./endConditions.js";
import { newGame } from "./newGame.js";
import { endSemester } from "./semester/endSemester.js";
import type { EngineState } from "./types.js";

const game = (overrides: Partial<EngineState> = {}, seed = 1): EngineState => ({
  ...newGame({ country: "Vessária", president: "Helena Duarte", situation: "stable", seed }, defaultContent), ...overrides,
});

/** Ignores ongoing coups: the passive player does not reach 20 years with the current catalog (#46). */
function playUntilEnd(start: EngineState, maxSemesters: number): EngineState {
  let state = start;
  for (let i = 0; i < maxSemesters && !checkEnd({ ...state, defeat: null }); i++) {
    state = { ...endSemester(state, defaultContent).state, defeat: null };
  }
  return state;
}

describe("checkEnd", () => {
  it("an ongoing game does not end", () => {
    expect(checkEnd(game())).toBeNull();
    expect(checkEnd(game({ turn: 80, turnsInPower: 39 }))).toBeNull();
  });

  it.each(["coup", "attack", "revolution"] as const)("%s ends with its own reason", (defeat) => {
    expect(checkEnd(game({ defeat }))).toBe(defeat);
  });

  it("20 years count in consecutive turns, not elections won", () => {
    expect(checkEnd(game({ turnsInPower: 39, history: [] }))).toBeNull();
    expect(checkEnd(game({ turnsInPower: 40, history: [] }))).toBe("twentyYears");
  });

  it("40 years without a win is a defeat", () => {
    expect(checkEnd(game({ turn: 81, turnsInPower: 0 }))).toBe("fortyYears");
  });

  it("risk-based defeat takes precedence over a win in the same semester", () => {
    expect(checkEnd(game({ turnsInPower: 40, defeat: "coup" }))).toBe("coup");
  });

  it("40 turns under authoritarianism, without elections, end in victory", () => {
    const end = playUntilEnd(game({ activeNodes: ["end-of-elections"] }), 45);
    expect(checkEnd(end)).toBe("twentyYears");
    expect(end.turnsInPower).toBe(40);
    expect(end.turn).toBe(41);
    expect(end.history).toHaveLength(5);
  });
});
