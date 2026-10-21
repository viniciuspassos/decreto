import { defaultContent } from "./content.js";
import { newGame } from "./newGame.js";
import { endGameResult, rankFigures } from "./ranking.js";
import type { EngineState } from "./types.js";

const game = (activeNodes: string[]): EngineState => ({
  ...newGame({ country: "Vessária", president: "Helena Duarte", situation: "stable", seed: 1 }, defaultContent), activeNodes,
});

describe("rankFigures", () => {
  it("ranks figures by the share of active nodes that refer to them", () => {
    const state = game(["strategic-state-company", "minimum-wage-raise", "privatizations", "minimal-state"]);
    expect(rankFigures(state, defaultContent)).toEqual([
      { figureId: "getulio-vargas", similarity: 50 },
      { figureId: "fernando-henrique-cardoso", similarity: 25 },
      { figureId: "margaret-thatcher", similarity: 25 },
    ]);
  });

  it("falls back to Mandela when active nodes have no historical precedent", () => {
    expect(rankFigures(game([]), defaultContent)).toEqual([{ figureId: "nelson-mandela", similarity: 100 }]);
  });
});

describe("endGameResult", () => {
  it("only 20 years counts as a win and lists the most used trees", () => {
    const state = game(["torture", "secret-police", "privatizations"]);
    const victory = endGameResult(state, "twentyYears", defaultContent);
    expect(victory.outcome).toBe("victory");
    expect(victory.topTrees).toEqual(["secret-police", "free-market"]);
    expect(endGameResult(state, "attack", defaultContent)).toMatchObject({ outcome: "defeat", reason: "attack" });
  });
});
