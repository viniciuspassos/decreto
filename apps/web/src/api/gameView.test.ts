import { gameFixture } from "../test/gameFixture.js";
import { activeCount, depthOf, nodeCost, nodeStatus, playableGame, queueCost, treeOf } from "./gameView.js";

describe("gameView", () => {
  it("uses server state and preview for node status and costs", () => {
    const game = playableGame(gameFixture());
    expect(nodeStatus(game, "privatizations")).toBe("available");
    expect(nodeCost(game, "privatizations")).toBe(20);
    game.queue = ["privatizations"];
    game.preview = { nodes: { privatizations: { status: "queued", cost: 20 } }, totalCost: 20, remaining: 40, errors: [] };
    expect(nodeStatus(game, "privatizations")).toBe("queued");
    expect(nodeCost(game, "privatizations")).toBe(20);
    expect(queueCost(game)).toBe(20);
  });

  it("looks up only static tree metadata", () => {
    expect(treeOf("privatizations")?.id).toBe("free-market");
    expect(depthOf("privatizations")).toBe(1);
    expect(activeCount({ ...playableGame(gameFixture()), activeNodes: ["privatizations"] }, "free-market")).toBe(1);
  });
});
