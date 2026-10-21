import {
  MAX_ACTIONS,
  activeCount,
  campaignOptions,
  checkEnd,
  depthOf,
  endGame,
  endSemester,
  isElectionTurn,
  loadSave,
  newGame,
  nodeCost,
  nodeStatus,
  projectVotes,
  queuedCost,
  runElection,
  toggleQueued,
  treeOf,
} from "./mockApi";

const fresh = () => ({ ...newGame("Vessária", "Helena", "unstable"), capital: 1000 });

describe("mockApi", () => {
  it("cost matches the S3 example: arrest opponents = 48", () => {
    expect(depthOf("arrest-opponents")).toBe(3);
    expect(nodeCost("arrest-opponents")).toBe(48);
    expect(nodeCost("secret-police")).toBe(20);
  });

  it("treeOf and activeCount locate the node tree", () => {
    expect(treeOf("torture")?.id).toBe("secret-police");
    expect(activeCount(loadSave(), "secret-police")).toBe(2);
  });

  it("a node is available only when its predecessor is active and the opposing tree is inactive", () => {
    const g = { ...fresh(), activeNodes: ["mandatory-registration"] };
    expect(nodeStatus(g, "mandatory-registration")).toBe("active");
    expect(nodeStatus(g, "carry-restriction")).toBe("available");
    expect(nodeStatus(g, "gun-buyback")).toBe("blocked");
    expect(nodeStatus(g, "easier-registration")).toBe("blocked");
    expect(nodeStatus(g, "lifetime-title")).toBe("blocked");
  });

  it("queue respects the 6-action limit and capital, and toggles off when clicked again", () => {
    let g = fresh();
    g = toggleQueued(g, "secret-police");
    expect(nodeStatus(g, "secret-police")).toBe("queued");
    expect(queuedCost(g)).toBe(20);
    expect(toggleQueued(g, "secret-police").queue).toEqual([]);
    ["privatizations", "outsourcing", "emission-targets", "easier-visas", "public-cameras", "state-lottery"].forEach((n) => {
      g = toggleQueued(g, n);
    });
    expect(g.queue).toHaveLength(MAX_ACTIONS);
    expect(toggleQueued({ ...fresh(), capital: 10 }, "secret-police").queue).toEqual([]);
  });

  it("endSemester activates the queue, charges capital, advances the turn, and reveals a figure", () => {
    const g = toggleQueued(fresh(), "privatizations");
    const { state, report, event } = endSemester(g);
    expect(state.turn).toBe(2);
    expect(state.activeNodes).toContain("privatizations");
    expect(state.queue).toEqual([]);
    expect(state.capital).toBe(1000 - 20 + g.capitalPerTurn);
    expect(report.groupChanges.find((c) => c.id === "business")?.delta).toBe(4);
    expect(event?.figureId).toBe("fernando-henrique-cardoso");
  });

  it("elections occur at the start of each term after the first", () => {
    expect(isElectionTurn({ ...fresh(), turn: 8 })).toBe(false);
    expect(isElectionTurn({ ...fresh(), turn: 9 })).toBe(true);
  });

  it("promises: one per field, vote projection, and election outcome", () => {
    const g = { ...fresh(), turn: 9 };
    const options = campaignOptions(g);
    expect(options).toHaveLength(6);
    expect(projectVotes(g, [])).toBe(50);
    const won = runElection({ ...g, approval: 60 }, options.slice(0, 1));
    expect(won.won).toBe(true);
    expect(won.state.term).toBe(2);
    const lost = runElection({ ...g, approval: 30 }, []);
    expect(lost.won).toBe(false);
    expect(lost.state.turn).toBe(17);
  });

  it("game end: coup, 20 years, and 40 years", () => {
    expect(checkEnd({ ...fresh(), approval: 10 })).toBe("coup");
    const history = Array.from({ length: 5 }, (_, i) => ({ term: i + 1, inPower: true }));
    expect(checkEnd({ ...fresh(), history })).toBe("twentyYears");
    expect(checkEnd({ ...fresh(), turn: 81 })).toBe("fortyYears");
    expect(checkEnd(fresh())).toBeNull();
  });

  it("endGame ranks figures from active policies", () => {
    const result = endGame(loadSave(), "twentyYears");
    expect(result.outcome).toBe("victory");
    expect(result.ranking[0]?.figureId).toBeDefined();
    expect(result.topTrees[0]).toBe("secret-police");
    expect(endGame(fresh(), "coup").ranking[0]?.figureId).toBe("nelson-mandela");
  });
});
