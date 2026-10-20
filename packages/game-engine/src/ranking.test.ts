import { defaultContent } from "./content.js";
import { newGame } from "./newGame.js";
import { endGameResult, rankFigures } from "./ranking.js";
import type { EngineState } from "./types.js";

const game = (activeNodes: string[]): EngineState => ({
  ...newGame({ country: "Vessária", president: "Helena Duarte", situation: "stable", seed: 1 }, defaultContent), activeNodes,
});

describe("rankFigures", () => {
  it("ordena as figuras pela fatia dos nós ativos que remetem a elas", () => {
    const state = game(["strategic-state-company", "minimum-wage-raise", "privatizations", "minimal-state"]);
    expect(rankFigures(state, defaultContent)).toEqual([
      { figureId: "getulio-vargas", similarity: 50 },
      { figureId: "fernando-henrique-cardoso", similarity: 25 },
      { figureId: "margaret-thatcher", similarity: 25 },
    ]);
  });

  it("sem precedente histórico nos nós ativos, cai em Mandela", () => {
    expect(rankFigures(game([]), defaultContent)).toEqual([{ figureId: "nelson-mandela", similarity: 100 }]);
  });
});

describe("endGameResult", () => {
  it("só 20 anos é vitória e lista as árvores mais usadas", () => {
    const state = game(["torture", "secret-police", "privatizations"]);
    const victory = endGameResult(state, "twentyYears", defaultContent);
    expect(victory.outcome).toBe("victory");
    expect(victory.topTrees).toEqual(["secret-police", "free-market"]);
    expect(endGameResult(state, "attack", defaultContent)).toMatchObject({ outcome: "defeat", reason: "attack" });
  });
});
