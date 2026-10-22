import type { GameEventDefinition } from "@decreto/game-content";
import { defaultContent } from "../content.js";
import { newGame } from "../newGame.js";
import type { Rng } from "../rng.js";
import { createRng } from "../rng.js";
import { canAfford, resolveDefaultChoices, resolveEventChoice } from "./choices.js";
import { conditionMet, drawEvents, eventWeight, rollEventCount } from "./events.js";

const game = () => newGame({ country: "Vessária", president: "Helena Duarte", situation: "unstable", seed: 1 }, defaultContent);
const def = (id: string) => defaultContent.events.find((e) => e.id === id) as GameEventDefinition;
const fixedRng = (value: number): Rng => ({ next: () => value, normal: () => 0, seed: () => 0 });

function weight(id: string, setup: (s: ReturnType<typeof game>) => void, applied: string[] = []) {
  const state = game();
  state.lastPositiveEventTurn = state.turn;
  setup(state);
  return eventWeight(def(id), applied, { state, content: defaultContent });
}

describe("eventWeight", () => {
  it("uses the weight of the satisfied trigger; 0 without a trigger", () => {
    expect(weight("buyback-record", (s) => { s.activeNodes = ["gun-buyback"]; })).toBe(4);
    expect(weight("buyback-record", () => {})).toBe(0);
  });

  it("a node activated this semester weighs 1 + 0.5 × depth", () => {
    expect(weight("buyback-record", (s) => { s.activeNodes = ["gun-buyback"]; }, ["gun-buyback"])).toBe(10);
  });

  it("antimonotonicity: positive weighs ×1.5 with no positive in the last 2 semesters", () => {
    expect(weight("buyback-record", (s) => { s.activeNodes = ["gun-buyback"]; s.lastPositiveEventTurn = null; })).toBe(6);
  });

  it("scales by distance from the threshold and applies a conditional multiplier", () => {
    expect(weight("organized-crime-wave", (s) => { s.indicators.crime = 70; })).toBe(6);
    expect(weight("military-abuse-viral", (s) => { s.activeNodes = ["military-on-streets"]; s.indicators.pressFreedom = 50; })).toBe(7.5);
  });

  it("respects cooldown, one-time events, and blocking nodes", () => {
    expect(weight("good-harvest", (s) => { s.eventTurns["good-harvest"] = s.turn - 1; })).toBe(0);
    expect(weight("good-harvest", (s) => { s.eventTurns["good-harvest"] = s.turn - 4; })).toBe(2);
    expect(weight("judges-resign", (s) => { s.activeNodes = ["judiciary-control"]; s.eventTurns["judges-resign"] = -50; })).toBe(0);
    expect(weight("corruption-scoop", (s) => { s.indicators.corruption = 60; s.activeNodes = ["censorship"]; })).toBe(0);
  });

  it("evaluates approval, group support, military mood, and tax rate conditions", () => {
    expect(weight("mass-protests", (s) => { s.approval = 20; })).toBe(4);
    expect(weight("police-strike", (s) => { const g = s.groups.find((x) => x.id === "security-forces"); if (g) g.support = 20; })).toBe(4);
    expect(weight("coup-rumors", (s) => { s.actors.military = "hostile"; })).toBe(5);
    expect(weight("capital-flight", (s) => { s.taxRate = 60; })).toBe(4);
    expect(weight("investment-boom", (s) => { s.taxRate = 20; })).toBe(3);
    expect(weight("climate-award", (s) => { s.indicators.pollution = 20; })).toBe(3);
  });
});

describe("conditionMet", () => {
  it("approval above threshold and minimum recession level", () => {
    const state = game();
    expect(conditionMet({ type: "approvalAbove", threshold: 40 }, state)).toBe(true);
    expect(conditionMet({ type: "recessionAtLeast", threshold: 1 }, state)).toBe(false);
    state.recessionLevel = 2;
    expect(conditionMet({ type: "recessionAtLeast", threshold: 1 }, state)).toBe(true);
  });
});

describe("drawEvents", () => {
  it("1, 2, or 3 events with the probabilities in §4.1", () => {
    expect(rollEventCount(fixedRng(0.1))).toBe(1);
    expect(rollEventCount(fixedRng(0.5))).toBe(2);
    expect(rollEventCount(fixedRng(0.95))).toBe(3);
  });

  it("with everything on cooldown, an 'always' event still occurs", () => {
    const state = game();
    defaultContent.events.forEach((e) => { state.eventTurns[e.id] = state.turn; });
    const events = drawEvents({ state, content: defaultContent, rng: createRng(9) }, []);
    expect(events.length).toBeGreaterThanOrEqual(1);
  });

  it("marks infrastructure collapse as a milestone with artwork", () => {
    const content = { ...defaultContent, events: [def("infrastructure-collapse")] };
    const [event] = drawEvents({ state: game(), content, rng: createRng(9) }, []);

    expect(event).toEqual({ id: "infrastructure-collapse", turn: 1, pending: false, image: true });
  });

  it("cooldown prevents repetition while another event is eligible", () => {
    const content = { ...defaultContent, events: [def("good-harvest"), def("sports-victory")] };
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((seed) => {
      const state = game();
      state.turn = 5;
      state.eventTurns["good-harvest"] = 3;
      const ids = drawEvents({ state, content, rng: createRng(seed) }, []).map((e) => e.id);
      expect(ids).toEqual(["sports-victory"]);
    });
  });

  it("an event with a choice remains pending and records the turn", () => {
    const state = game();
    state.actors.military = "hostile";
    const content = { ...defaultContent, events: [def("coup-rumors")] };
    const [event] = drawEvents({ state, content, rng: createRng(1) }, []);
    expect(event).toEqual({ id: "coup-rumors", turn: 1, pending: true, image: false });
    expect(state.pendingChoices).toEqual([{ eventId: "coup-rumors", turn: 1 }]);
    expect(state.eventRisks.coup).toBe(3);
    expect(state.eventTurns["coup-rumors"]).toBe(1);
  });
});

describe("escolhas de evento", () => {
  const pending = (eventId: string) => {
    const s = game();
    s.pendingChoices = [{ eventId, turn: 1 }];
    return s;
  };

  it("resolveEventChoice applies the option without changing the input", () => {
    const state = pending("coup-rumors");
    const next = resolveEventChoice(state, "coup-rumors", "a", defaultContent);
    expect(next.pendingChoices).toEqual([]);
    expect(next.eventRisks.coup).toBe(-6);
    expect(next.groups.find((g) => g.id === "security-forces")?.support).toBe(42);
    expect(state.pendingChoices).toHaveLength(1);
  });

  it("rejects a choice that is not pending or has no capital", () => {
    expect(() => resolveEventChoice(game(), "coup-rumors", "a", defaultContent)).toThrow();
    const broke = pending("general-strike");
    broke.capital = 5;
    expect(() => resolveEventChoice(broke, "general-strike", "a", defaultContent)).toThrow();
    expect(canAfford(broke, { capital: -5 })).toBe(true);
  });

  it("an open choice becomes option A, or B if A lacks capital", () => {
    const withCapital = pending("general-strike");
    resolveDefaultChoices({ state: withCapital, content: defaultContent });
    expect(withCapital.capital).toBe(50);
    const broke = pending("general-strike");
    broke.capital = 5;
    resolveDefaultChoices({ state: broke, content: defaultContent });
    expect(broke.capital).toBe(5);
    expect(broke.groups.find((g) => g.id === "workers")?.support).toBe(42);
    expect(broke.pendingChoices).toEqual([]);
  });
});
