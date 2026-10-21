import { defaultContent } from "../content.js";
import { newGame } from "../newGame.js";
import { createRng } from "../rng.js";
import type { EngineState } from "../types.js";
import { cloneState, displayedIndicators } from "./common.js";
import { capitalGain, endSemester, InvalidQueueError } from "./endSemester.js";

const game = (seed = 1) => newGame({ country: "Vessária", president: "Helena Duarte", situation: "unstable", seed }, defaultContent);
const drawnIds = new Set(defaultContent.events.map((e) => e.id));

function play(state: EngineState, semesters: number, content = defaultContent) {
  const reports = [];
  let current = state;
  for (let i = 0; i < semesters && !current.defeat; i++) {
    const result = endSemester(current, content);
    reports.push(result.report);
    current = result.state;
  }
  return { state: current, reports };
}

describe("endSemester", () => {
  it("is reproducible: the same seed generates the same semester", () => {
    const start = { ...game(42), queue: ["harsher-sentences"] };
    expect(endSemester(start, defaultContent)).toEqual(endSemester(start, defaultContent));
    expect(endSemester(game(43), defaultContent).state.base).not.toEqual(endSemester(game(42), defaultContent).state.base);
  });

  it("does not change the input state and advances the turn and seed", () => {
    const start = { ...game(), queue: ["harsher-sentences"] };
    const snapshot = cloneState(start);
    const { state } = endSemester(start, defaultContent);
    expect(start).toEqual(snapshot);
    expect(state.turn).toBe(2);
    expect(state.turnsInPower).toBe(1);
    expect(state.seed).not.toBe(start.seed);
    expect(state.activeNodes).toEqual(["harsher-sentences"]);
    expect(state.queue).toEqual([]);
  });

  it("always produces at least 1 random event, with no repeats in the semester and at most 1 image", () => {
    const { reports } = play(game(7), 30);
    reports.forEach((report) => {
      const drawn = report.events.filter((e) => drawnIds.has(e.id));
      expect(drawn.length).toBeGreaterThanOrEqual(1);
      expect(new Set(drawn.map((e) => e.id)).size).toBe(drawn.length);
      expect(drawn.filter((e) => e.image).length).toBeLessThanOrEqual(1);
    });
  });

  it("node effects accumulate along the tree", () => {
    const base = game();
    const crime = (activeNodes: string[]) => displayedIndicators({ state: { ...base, activeNodes }, content: defaultContent }).crime;
    expect(crime(["harsher-sentences"])).toBeCloseTo(base.indicators.crime - 2);
    expect(crime(["harsher-sentences", "military-on-streets"])).toBeCloseTo(base.indicators.crime - 7);
  });

  it("debt grows each semester without policies", () => {
    const quiet = { ...defaultContent, events: [] };
    const { reports, state } = play(game(3), 6, quiet);
    const debts = [...reports.map((r) => r.indicatorsBefore.debt), state.indicators.debt];
    debts.slice(1).forEach((debt, i) => expect(debt).toBeGreaterThan(debts[i] ?? Infinity));
  });

  it("capital gained uses the new approval, after paying for the queue", () => {
    const start = { ...game(), queue: ["harsher-sentences"] };
    const { state, report } = endSemester(start, defaultContent);
    expect(state.capitalPerTurn).toBe(capitalGain(state.approval));
    expect(state.approval).not.toBe(report.approvalBefore);
    expect(state.capital).toBe(60 - 24 + capitalGain(state.approval));
  });

  it("does not advance a game that has already been lost", () => {
    expect(() => endSemester({ ...game(), defeat: "coup" }, defaultContent)).toThrow("game over");
  });

  it("an open choice defaults to option A before the queue, using capital at the start of the turn", () => {
    const start = { ...game(), capital: 34, queue: ["harsher-sentences"], pendingChoices: [{ eventId: "general-strike", turn: 0 }] };
    const { state } = endSemester(start, defaultContent);
    expect(state.capital).toBe(34 - 10 - 24 + capitalGain(state.approval));
    expect(state.pendingChoices).toEqual([]);
    expect(() => endSemester({ ...start, capital: 30 }, defaultContent)).toThrow(InvalidQueueError);
  });

  it("rejects an invalid queue", () => {
    const invalid = { ...game(), queue: ["mandatory-registration", "easier-registration"] };
    expect(() => endSemester(invalid, defaultContent)).toThrow(InvalidQueueError);
  });

  it("a coup occurs with low approval, recession, and hostile military", () => {
    const doomed = (seed: number): EngineState => {
      const s = game(seed);
      s.groups.forEach((g) => { if (g.support !== null) g.support = 5; });
      s.indicators.debt = 140;
      s.recessionLevel = 2;
      return s;
    };
    const coups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((seed) => {
      const { state, report } = endSemester(doomed(seed), defaultContent);
      expect(report.risks.coup).toBeGreaterThanOrEqual(20);
      return state.defeat === "coup" && report.events.some((e) => e.id === "coup");
    });
    expect(coups.length).toBeGreaterThan(0);
  });

  it("the report includes risks, group changes, and events", () => {
    const { report } = endSemester({ ...game(), queue: ["harsher-sentences"] }, defaultContent);
    expect(report.applied).toEqual(["harsher-sentences"]);
    expect(Object.keys(report.risks).sort()).toEqual(["attack", "coup", "rebels", "revolution"]);
    expect(report.groupChanges.find((g) => g.id === "middle-class")).toBeDefined();
    expect(report.events.length).toBeGreaterThan(0);
  });

  it("starts the crisis after a crisis event and decays temporary modifiers", () => {
    const s = game();
    s.lastCrisisTurn = 1;
    s.moodMods = { media: 10, military: -8 };
    const { state } = endSemester(s, { ...defaultContent, events: [] });
    expect(state.crisis).toBe(true);
    expect(state.moodMods).toEqual({ media: 5, military: -4 });
  });

  it("createRng continues the sequence from the saved seed", () => {
    const rng = createRng(5);
    rng.next();
    const resumed = createRng(rng.seed());
    expect(resumed.next()).toBe(rng.next());
  });
});
