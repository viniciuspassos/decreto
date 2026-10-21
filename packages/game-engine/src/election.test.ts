import { defaultContent } from "./content.js";
import { campaignOptions, projectVotes, runElection } from "./election.js";
import { newGame } from "./newGame.js";
import { isCampaignDue, isElectionDue } from "./semester/term.js";
import { endSemester } from "./semester/endSemester.js";
import type { EngineState } from "./types.js";

const game = (overrides: Partial<EngineState> = {}, seed = 1): EngineState => ({
  ...newGame({ country: "Vessária", president: "Helena Duarte", situation: "unstable", seed }, defaultContent),
  turn: 9, turnsInPower: 8, ...overrides,
});

/** Equal support in every group that has emerged; approval is the weighted average, so it equals the value itself. */
const withSupport = (support: number, overrides: Partial<EngineState> = {}): EngineState => {
  const state = game(overrides);
  state.groups.forEach((g) => { if (g.support !== null) g.support = support; });
  return state;
};

const supportOf = (state: EngineState, id: string) => state.groups.find((g) => g.id === id)?.support;

describe("isElectionDue", () => {
  it("an election takes place at the end of a term and only once per term", () => {
    expect(isElectionDue(game({ turn: 8 }))).toBe(false);
    expect(isElectionDue(game({ turn: 9 }))).toBe(true);
    expect(isElectionDue(game({ turn: 9, term: 2 }))).toBe(false);
  });

  it.each(["election-postponement", "end-of-elections"])("%s cancels the election and the term continues without a ballot", (nodeId) => {
    const state = game({ turn: 8, activeNodes: [nodeId] });
    expect(isElectionDue(game({ activeNodes: [nodeId] }))).toBe(false);
    const next = endSemester(state, defaultContent).state;
    expect(next.turn).toBe(9);
    expect(next.term).toBe(2);
    expect(next.termsInRow).toBe(2);
    expect(next.history).toEqual([{ term: 1, inPower: true }]);
  });
});

describe("isCampaignDue", () => {
  it("opens the campaign after the final semester and skips it when elections are suspended", () => {
    expect(isCampaignDue(game({ turn: 7 }))).toBe(false);
    expect(isCampaignDue(game({ turn: 8 }))).toBe(false);
    expect(isCampaignDue(game({ turn: 9 }))).toBe(true);
    expect(isCampaignDue(game({ turn: 9, activeNodes: ["election-postponement"] }))).toBe(false);
  });
});

describe("campaignOptions", () => {
  it("offers one pledge per field except Power, always with an available node", () => {
    const options = campaignOptions(game(), defaultContent);
    expect(options).toHaveLength(9);
    const fields = options.map((o) => defaultContent.policyTrees.find((t) => t.nodes.includes(o.nodeId))?.field);
    expect(new Set(fields).size).toBe(9);
    expect(fields).not.toContain("power");
    expect(options.find((o) => o.nodeId === "strategic-state-company")).toEqual({ nodeId: "strategic-state-company", gains: [], loses: ["business", "rich"] });
    expect(options.find((o) => o.nodeId === "public-network-expansion")?.gains).toEqual(["workers", "poor", "retirees"]);
  });

  it("advances to the next available node and respects opposing trees", () => {
    const options = campaignOptions(game({ activeNodes: ["privatizations"] }), defaultContent).map((o) => o.nodeId);
    expect(options).toContain("deregulation");
    expect(options).not.toContain("strategic-state-company");
    expect(options).not.toContain("privatizations");
  });
});

describe("projectVotes", () => {
  it("a pledge motivates those who like it and alienates those who do not, without changing state", () => {
    const state = game();
    expect(projectVotes(state, [], defaultContent)).toBe(50);
    expect(projectVotes(state, ["public-network-expansion"], defaultContent)).toBeGreaterThan(50);
    expect(projectVotes(state, ["strategic-state-company"], defaultContent)).toBeLessThan(50);
    expect(state.promises).toEqual([]);
  });

  it("rejects a pledge outside the options or a repeated pledge", () => {
    expect(() => projectVotes(game(), ["deregulation"], defaultContent)).toThrow("invalid promises");
    expect(() => projectVotes(game(), ["public-network-expansion", "public-network-expansion"], defaultContent)).toThrow("invalid promises");
  });
});

describe("runElection", () => {
  it("victory starts a new term with the pledges and records the history", () => {
    const { state, won } = runElection(withSupport(55), ["public-network-expansion"], defaultContent);
    expect(won).toBe(true);
    expect(state.term).toBe(2);
    expect(state.termsInRow).toBe(2);
    expect(state.turn).toBe(9);
    expect(state.promises).toEqual(["public-network-expansion"]);
    expect(state.history).toEqual([{ term: 1, inPower: true }]);
    expect(supportOf(state, "workers")).toBe(59);
    expect(supportOf(state, "business")).toBe(55);
  });

  it("keeps a final-turn campaign valid when its policy was activated before the vote", () => {
    const state = withSupport(70, { activeNodes: ["privatizations"], campaignPromises: ["privatizations"] });
    const { state: result, won } = runElection(state, ["privatizations"], defaultContent);
    expect(won).toBe(true);
    expect(result.promises).toEqual(["privatizations"]);
    expect(result.campaignPromises).toBeUndefined();
  });

  it("a margin of 20 points or more triggers the honeymoon", () => {
    expect(runElection(withSupport(55), [], defaultContent).state.honeymoon).toBe(false);
    expect(runElection(withSupport(60), [], defaultContent).state.honeymoon).toBe(true);
  });

  it("an unfulfilled pledge reduces support among those who liked it; a fulfilled one does not", () => {
    const kept = runElection(withSupport(70, { promises: ["privatizations"], activeNodes: ["privatizations"] }), [], defaultContent);
    const broken = runElection(withSupport(70, { promises: ["privatizations"] }), [], defaultContent);
    expect(supportOf(kept.state, "business")).toBe(70);
    expect(supportOf(broken.state, "business")).toBe(64);
    expect(supportOf(broken.state, "rich")).toBe(64);
    expect(supportOf(broken.state, "workers")).toBe(70);
    expect(broken.state.promises).toEqual([]);
  });

  it("defeat hands 8 semesters to the AI without changing the player nodes", () => {
    const start = withSupport(30, { activeNodes: ["privatizations", "harsher-sentences"], capital: 77, queue: ["outsourcing"] });
    const { state, won } = runElection(start, [], defaultContent);
    expect(won).toBe(false);
    expect(state.turn).toBe(17);
    expect(state.term).toBe(3);
    expect(state.activeNodes).toEqual(["privatizations", "harsher-sentences"]);
    expect(state.capital).toBe(77);
    expect(state.queue).toEqual([]);
    expect(state.turnsInPower).toBe(0);
    expect(state.history).toEqual([{ term: 1, inPower: false }]);
    expect(isElectionDue(state)).toBe(false);
    expect(isCampaignDue(state)).toBe(false);
  });

  it("the AI government falling is not a player defeat", () => {
    [1, 2, 3, 4, 5].forEach((seed) => {
      const start = withSupport(5, { seed });
      start.indicators.debt = 140;
      expect(runElection(start, [], defaultContent).state.defeat).toBeNull();
    });
  });

  it("runs only when an election is due and the game is in progress", () => {
    expect(() => runElection(game({ turn: 8 }), [], defaultContent)).toThrow("no election due");
    expect(() => runElection(game({ defeat: "coup" }), [], defaultContent)).toThrow("no election due");
    expect(() => runElection(game({ activeNodes: ["end-of-elections"] }), [], defaultContent)).toThrow("no election due");
  });

  it("updates loyalty and does not inherit pending choices from the AI government", () => {
    expect(runElection(withSupport(59), [], defaultContent).state.groups[0]?.loyalty).toBe("medium");
    expect(runElection(withSupport(60), [], defaultContent).state.groups[0]?.loyalty).toBe("high");
    expect(runElection(withSupport(30), [], defaultContent).state.pendingChoices).toEqual([]);
  });

  it("the player runs again after losing and can win", () => {
    const lost = runElection(withSupport(30), [], defaultContent).state;
    lost.turn = 25;
    lost.groups.forEach((g) => { if (g.support !== null) g.support = 65; });
    const back = runElection(lost, [], defaultContent);
    expect(back.won).toBe(true);
    expect(back.state.term).toBe(4);
    expect(back.state.termsInRow).toBe(1);
    expect(back.state.history.map((h) => h.inPower)).toEqual([false, true]);
  });
});
