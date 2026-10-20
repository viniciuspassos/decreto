import { defaultContent } from "./content.js";
import { checkEnd } from "./endConditions.js";
import { newGame } from "./newGame.js";
import { endSemester } from "./semester/endSemester.js";
import type { EngineState } from "./types.js";

const game = (overrides: Partial<EngineState> = {}, seed = 1): EngineState => ({
  ...newGame({ country: "Vessária", president: "Helena Duarte", situation: "stable", seed }, defaultContent), ...overrides,
});

/** Ignora as derrubadas rolando: o jogador passivo não chega aos 20 anos com o catálogo atual (#46). */
function playUntilEnd(start: EngineState, maxSemesters: number): EngineState {
  let state = start;
  for (let i = 0; i < maxSemesters && !checkEnd({ ...state, defeat: null }); i++) {
    state = { ...endSemester(state, defaultContent).state, defeat: null };
  }
  return state;
}

describe("checkEnd", () => {
  it("partida em curso não termina", () => {
    expect(checkEnd(game())).toBeNull();
    expect(checkEnd(game({ turn: 80, turnsInPower: 39 }))).toBeNull();
  });

  it.each(["coup", "attack", "revolution"] as const)("%s encerra com o próprio motivo", (defeat) => {
    expect(checkEnd(game({ defeat }))).toBe(defeat);
  });

  it("20 anos contam em turnos seguidos, não em eleições ganhas", () => {
    expect(checkEnd(game({ turnsInPower: 39, history: [] }))).toBeNull();
    expect(checkEnd(game({ turnsInPower: 40, history: [] }))).toBe("twentyYears");
  });

  it("40 anos sem vencer é derrota", () => {
    expect(checkEnd(game({ turn: 81, turnsInPower: 0 }))).toBe("fortyYears");
  });

  it("derrota por risco prevalece sobre a vitória do mesmo semestre", () => {
    expect(checkEnd(game({ turnsInPower: 40, defeat: "coup" }))).toBe("coup");
  });

  it("40 turnos sob autoritarismo, sem urnas, terminam em vitória", () => {
    const end = playUntilEnd(game({ activeNodes: ["end-of-elections"] }), 45);
    expect(checkEnd(end)).toBe("twentyYears");
    expect(end.turnsInPower).toBe(40);
    expect(end.turn).toBe(41);
    expect(end.history).toHaveLength(5);
  });
});
