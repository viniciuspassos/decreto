import { defaultContent } from "./content.js";
import { campaignOptions, projectVotes, runElection } from "./election.js";
import { newGame } from "./newGame.js";
import { isElectionDue } from "./semester/term.js";
import { endSemester } from "./semester/endSemester.js";
import type { EngineState } from "./types.js";

const game = (overrides: Partial<EngineState> = {}, seed = 1): EngineState => ({
  ...newGame({ country: "Vessária", president: "Helena Duarte", situation: "unstable", seed }, defaultContent),
  turn: 9, turnsInPower: 8, ...overrides,
});

/** Apoio igual em todos os grupos que já surgiram; a aprovação é a média ponderada, logo o próprio valor. */
const withSupport = (support: number, overrides: Partial<EngineState> = {}): EngineState => {
  const state = game(overrides);
  state.groups.forEach((g) => { if (g.support !== null) g.support = support; });
  return state;
};

const supportOf = (state: EngineState, id: string) => state.groups.find((g) => g.id === id)?.support;

describe("isElectionDue", () => {
  it("a eleição vem ao fim do mandato e só uma vez por mandato", () => {
    expect(isElectionDue(game({ turn: 8 }))).toBe(false);
    expect(isElectionDue(game({ turn: 9 }))).toBe(true);
    expect(isElectionDue(game({ turn: 9, term: 2 }))).toBe(false);
  });

  it.each(["election-postponement", "end-of-elections"])("%s cancela a eleição e o mandato segue sem urna", (nodeId) => {
    const state = game({ turn: 8, activeNodes: [nodeId] });
    expect(isElectionDue(game({ activeNodes: [nodeId] }))).toBe(false);
    const next = endSemester(state, defaultContent).state;
    expect(next.turn).toBe(9);
    expect(next.term).toBe(2);
    expect(next.termsInRow).toBe(2);
    expect(next.history).toEqual([{ term: 1, inPower: true }]);
  });
});

describe("campaignOptions", () => {
  it("oferece uma promessa por campo, exceto Poder, sempre com nó disponível", () => {
    const options = campaignOptions(game(), defaultContent);
    expect(options).toHaveLength(9);
    const fields = options.map((o) => defaultContent.policyTrees.find((t) => t.nodes.includes(o.nodeId))?.field);
    expect(new Set(fields).size).toBe(9);
    expect(fields).not.toContain("power");
    expect(options.find((o) => o.nodeId === "strategic-state-company")).toEqual({ nodeId: "strategic-state-company", gains: [], loses: ["business", "rich"] });
    expect(options.find((o) => o.nodeId === "public-network-expansion")?.gains).toEqual(["workers", "poor", "retirees"]);
  });

  it("avança para o próximo nó disponível e respeita árvores opostas", () => {
    const options = campaignOptions(game({ activeNodes: ["privatizations"] }), defaultContent).map((o) => o.nodeId);
    expect(options).toContain("deregulation");
    expect(options).not.toContain("strategic-state-company");
    expect(options).not.toContain("privatizations");
  });
});

describe("projectVotes", () => {
  it("promessa anima quem gosta e afasta quem não gosta, sem alterar o estado", () => {
    const state = game();
    expect(projectVotes(state, [], defaultContent)).toBe(50);
    expect(projectVotes(state, ["public-network-expansion"], defaultContent)).toBeGreaterThan(50);
    expect(projectVotes(state, ["strategic-state-company"], defaultContent)).toBeLessThan(50);
    expect(state.promises).toEqual([]);
  });

  it("rejeita promessa fora das opções ou repetida", () => {
    expect(() => projectVotes(game(), ["deregulation"], defaultContent)).toThrow("invalid promises");
    expect(() => projectVotes(game(), ["public-network-expansion", "public-network-expansion"], defaultContent)).toThrow("invalid promises");
  });
});

describe("runElection", () => {
  it("vitória abre novo mandato com as promessas e registra o histórico", () => {
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

  it("margem de 20 pontos ou mais ativa a lua de mel", () => {
    expect(runElection(withSupport(55), [], defaultContent).state.honeymoon).toBe(false);
    expect(runElection(withSupport(60), [], defaultContent).state.honeymoon).toBe(true);
  });

  it("promessa não cumprida derruba o apoio de quem gostou; cumprida, não", () => {
    const kept = runElection(withSupport(70, { promises: ["privatizations"], activeNodes: ["privatizations"] }), [], defaultContent);
    const broken = runElection(withSupport(70, { promises: ["privatizations"] }), [], defaultContent);
    expect(supportOf(kept.state, "business")).toBe(70);
    expect(supportOf(broken.state, "business")).toBe(64);
    expect(supportOf(broken.state, "rich")).toBe(64);
    expect(supportOf(broken.state, "workers")).toBe(70);
    expect(broken.state.promises).toEqual([]);
  });

  it("derrota entrega 8 semestres à IA sem mexer nos nós do jogador", () => {
    const start = withSupport(30, { activeNodes: ["privatizations", "harsher-sentences"], capital: 77, queue: ["outsourcing"] });
    const { state, won } = runElection(start, [], defaultContent);
    expect(won).toBe(false);
    expect(state.turn).toBe(17);
    expect(state.term).toBe(2);
    expect(state.activeNodes).toEqual(["privatizations", "harsher-sentences"]);
    expect(state.capital).toBe(77);
    expect(state.queue).toEqual([]);
    expect(state.turnsInPower).toBe(0);
    expect(state.history).toEqual([{ term: 1, inPower: false }]);
    expect(isElectionDue(state)).toBe(true);
  });

  it("queda do governo da IA não é derrota do jogador", () => {
    [1, 2, 3, 4, 5].forEach((seed) => {
      const start = withSupport(5, { seed });
      start.indicators.debt = 140;
      expect(runElection(start, [], defaultContent).state.defeat).toBeNull();
    });
  });

  it("o jogador volta a concorrer depois de perder e pode vencer", () => {
    const lost = runElection(withSupport(30), [], defaultContent).state;
    lost.groups.forEach((g) => { if (g.support !== null) g.support = 65; });
    const back = runElection(lost, [], defaultContent);
    expect(back.won).toBe(true);
    expect(back.state.term).toBe(3);
    expect(back.state.termsInRow).toBe(1);
    expect(back.state.history.map((h) => h.inPower)).toEqual([false, true]);
  });
});
