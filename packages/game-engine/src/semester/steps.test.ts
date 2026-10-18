import { BASE_INDICATORS } from "@decreto/game-content";
import type { GroupState } from "@decreto/shared-types";
import { defaultContent } from "../content.js";
import { newGame } from "../newGame.js";
import { createRng, type Rng } from "../rng.js";
import { militaryScore, moodOf, updateMoods } from "./actors.js";
import { addSize, groupOf, type StepCtx } from "./common.js";
import { nextRecessionLevel, updateDebt, updateRecession } from "./debt.js";
import { rebelGrowth, revolutionaryGrowth, updateEmergent } from "./emergent.js";
import { applyEventEffects } from "./effects.js";
import { approvalOf, indicatorReaction, loyaltyOf, supportAnchor, updateSizes, updateSupport } from "./groups.js";
import { instability, targets, updateBase } from "./movement.js";
import { applyQueue, queueTotalCost, validateQueue } from "./queue.js";
import { attackRisk, coupRisk, fatalChance, revolutionRisk, rollRisks } from "./risks.js";

const game = (situation: "stable" | "unstable" | "crisis" = "unstable") =>
  newGame({ country: "Vessária", president: "Helena Duarte", situation, seed: 1 }, defaultContent);
const ctxOf = (state = game()): StepCtx => ({ state, content: defaultContent });
const fixedRng = (value: number): Rng => ({ next: () => value, normal: () => 0, seed: () => 0 });
const setSupport = (ctx: StepCtx, groupId: string, support: number) => {
  const g = groupOf(ctx.state, groupId);
  if (g) g.support = support;
};

describe("newGame", () => {
  it("parte do estado inicial da situação, com imposto a 30% e base = exibido", () => {
    const s = game("crisis");
    expect(s.indicators.unemployment).toBe(14.5);
    expect(s.indicators.health).toBe(BASE_INDICATORS.health);
    expect(s.base.gdp).toBe(-2.1);
    expect(s.previousBase).toEqual(s.base);
    expect(s.taxRate).toBe(30);
    expect(s.approval).toBe(50);
    expect(s.capital).toBe(60);
    expect(s.capitalPerTurn).toBe(25);
    expect(groupOf(s, "rebels")?.support).toBeNull();
    expect(s.actors).toEqual({ media: "neutral", military: "neutral" });
  });
});

describe("movimento da base", () => {
  it("instabilidade soma os excessos e satura em 2", () => {
    expect(instability(BASE_INDICATORS, 0)).toBe(0);
    expect(instability({ ...BASE_INDICATORS, debt: 130, inflation: 20 }, 1)).toBeCloseTo(1 + 0.5 + 0.25);
    expect(instability({ ...BASE_INDICATORS, debt: 400 }, 3)).toBe(2);
  });

  it("alvos acoplam indicadores e corrupção sobe com tempo no poder", () => {
    const t = targets(BASE_INDICATORS, 0);
    expect(t.unemployment).toBeCloseTo(8 - 1.5 * (1.8 - 2));
    expect(t.pressFreedom).toBe(60);
    expect(targets(BASE_INDICATORS, 16).corruption - t.corruption).toBe(10);
  });

  it("sem ruído, a base anda em direção ao alvo e guarda o semestre anterior", () => {
    const ctx = { ...ctxOf(), rng: fixedRng(0.5) };
    const before = ctx.state.base;
    updateBase(ctx);
    expect(ctx.state.previousBase).toEqual(before);
    expect(ctx.state.base.pressFreedom).toBeCloseTo(58 + 0.15 * 2);
  });
});

describe("dívida e recessão", () => {
  it("dívida soma déficit, juros e Dív 1× dos nós recém-ativados", () => {
    const passive = ctxOf();
    updateDebt(passive, []);
    expect(passive.state.indicators.debt).toBeCloseTo(74 + 0.3 + (74 * (3 - 1.8)) / 200);
    const spender = ctxOf();
    spender.state.activeNodes = ["gun-buyback"];
    updateDebt(spender, ["gun-buyback"]);
    expect(spender.state.indicators.debt - passive.state.indicators.debt).toBeCloseTo(2);
  });

  it("nível de recessão tem histerese", () => {
    expect(nextRecessionLevel(0, 100, 0)).toBe(1);
    expect(nextRecessionLevel(1, 95, 0)).toBe(1);
    expect(nextRecessionLevel(1, 85, 0)).toBe(0);
    expect(nextRecessionLevel(0, 50, -3)).toBe(1);
    expect(nextRecessionLevel(0, 50, -6)).toBe(2);
    expect(nextRecessionLevel(3, 165, 0)).toBe(3);
    expect(nextRecessionLevel(3, 155, 0)).toBe(2);
  });

  it("recessão desloca PIB/desemprego exibidos e gera eventos de início e fim", () => {
    const ctx = ctxOf();
    ctx.state.indicators.debt = 135;
    expect(updateRecession(ctx).map((e) => e.id)).toEqual(["recession-starts"]);
    expect(ctx.state.recessionLevel).toBe(2);
    expect(ctx.state.indicators.gdp).toBeCloseTo(1.8 - 2);
    ctx.state.indicators.debt = 50;
    expect(updateRecession(ctx).map((e) => e.id)).toEqual(["recession-ends"]);
    expect(updateRecession(ctx)).toEqual([]);
  });
});

describe("grupos", () => {
  it("aprovação é a média ponderada pelo tamanho, sem grupos emergentes", () => {
    const groups: GroupState[] = [
      { id: "a", size: 30, support: 60, delta: 0, loyalty: "medium", memory: null },
      { id: "b", size: 10, support: 20, delta: 0, loyalty: "medium", memory: null },
      { id: "c", size: 5, support: null, delta: 0, loyalty: "low", memory: null },
    ];
    expect(approvalOf(groups)).toBe(50);
    expect(approvalOf([])).toBe(0);
    expect([loyaltyOf(null), loyaltyOf(30), loyaltyOf(50), loyaltyOf(70)]).toEqual(["low", "low", "medium", "high"]);
  });

  it("reação a indicadores; corrupção some com imprensa amordaçada", () => {
    const ind = { ...BASE_INDICATORS, gdp: 1.5, unemployment: 15 };
    expect(indicatorReaction("workers", ind)).toBeCloseTo(-3);
    const corrupt = { ...BASE_INDICATORS, gdp: 1.5, unemployment: 9, corruption: 65 };
    expect(indicatorReaction("youth", corrupt)).toBeCloseTo(-0.15 * 20 * (58 / 60));
    expect(indicatorReaction("youth", { ...corrupt, pressFreedom: 0 })).toBe(0);
    expect(indicatorReaction("rich", { ...BASE_INDICATORS, gdp: 20 })).toBeCloseTo(0.6 * 4);
  });

  it("âncora desgasta por mandato e soma `anc` dos nós", () => {
    const ctx = ctxOf();
    expect(supportAnchor(ctx)).toBe(45);
    ctx.state.termsInRow = 3;
    ctx.state.activeNodes = ["government-propaganda"];
    expect(supportAnchor(ctx)).toBe(43);
  });

  it("tamanhos: `tam` com teto e pobres puxados pelo desemprego", () => {
    const ctx = ctxOf();
    ctx.state.activeNodes = ["official-religion"];
    ctx.state.indicators.unemployment = 18;
    updateSizes(ctx);
    expect(groupOf(ctx.state, "religious")?.size).toBeCloseTo(28.2);
    expect(groupOf(ctx.state, "poor")?.size).toBeCloseTo(34);
    addSize(ctx.state, "poor", -100);
    expect(groupOf(ctx.state, "poor")?.size).toBe(5);
  });

  it("apoio volta à âncora, sofre recessão e recalcula a aprovação", () => {
    const ctx = ctxOf();
    ctx.state.indicators.gdp = 1.5;
    ctx.state.recessionLevel = 1;
    updateSupport(ctx);
    expect(groupOf(ctx.state, "religious")?.support).toBeCloseTo(50 + 0.08 * -5 - 1);
    expect(groupOf(ctx.state, "rebels")?.support).toBeNull();
    expect(ctx.state.approval).toBeLessThan(50);
  });
});

describe("atores", () => {
  it("faixas de humor", () => {
    expect([moodOf(55), moodOf(40), moodOf(25), moodOf(24.9)]).toEqual(["loyal", "neutral", "critical", "hostile"]);
  });

  it("militares: apoio das forças + `mil` − dívida alta − recessão", () => {
    const ctx = ctxOf();
    ctx.state.activeNodes = ["harsher-sentences"];
    ctx.state.indicators.debt = 125;
    ctx.state.recessionLevel = 1;
    expect(militaryScore(ctx)).toBe(50 + 5 - 8 - 5);
  });

  it("censura segura a mídia em neutro; monopólio a deixa leal", () => {
    const ctx = ctxOf();
    ctx.state.approval = 0;
    updateMoods(ctx);
    expect(ctx.state.actors.media).toBe("hostile");
    ctx.state.activeNodes = ["censorship"];
    updateMoods(ctx);
    expect(ctx.state.actors.media).toBe("neutral");
    ctx.state.activeNodes = ["state-information-monopoly"];
    updateMoods(ctx);
    expect(ctx.state.actors.media).toBe("loyal");
  });
});

describe("riscos", () => {
  it("atentado cresce com revolucionários e desesperados; polícia secreta protege", () => {
    const ctx = ctxOf();
    addSize(ctx.state, "revolutionaries", 10);
    expect(attackRisk(ctx)).toBeCloseTo(8);
    setSupport(ctx, "workers", 10);
    expect(attackRisk(ctx)).toBeCloseTo(9);
    ctx.state.activeNodes = ["secret-police"];
    expect(attackRisk(ctx)).toBeCloseTo(9 * 0.7);
    expect(fatalChance(ctx)).toBe(25);
    ctx.state.activeNodes = ["secret-police", "military-on-streets", "mass-surveillance"];
    expect(fatalChance(ctx)).toBe(10);
  });

  it("revolução só com 5% de revolucionários, multiplicada pelo humor militar", () => {
    const ctx = ctxOf();
    addSize(ctx.state, "revolutionaries", 4);
    expect(revolutionRisk(ctx)).toBe(0);
    addSize(ctx.state, "revolutionaries", 6);
    ctx.state.actors.military = "hostile";
    expect(revolutionRisk(ctx)).toBeCloseTo(7.5 * 1.6);
  });

  it("golpe: militar leal limita a 3", () => {
    const ctx = ctxOf();
    ctx.state.approval = 10;
    ctx.state.actors.military = "hostile";
    expect(coupRisk(ctx)).toBe(12 + 10);
    ctx.state.actors.military = "loyal";
    expect(coupRisk(ctx)).toBe(3);
  });

  it("rolagem: atentado frustrado liga a crise; fatal e golpe derrotam", () => {
    const foiled = { ...ctxOf(), rng: { ...fixedRng(0.5) } };
    expect(rollRisks(foiled, { attack: 100, revolution: 0, coup: 0, rebels: 0 }).map((e) => e.id)).toEqual(["attack-foiled"]);
    expect(foiled.state.lastCrisisTurn).toBe(1);
    expect(foiled.state.defeat).toBeNull();
    const fatal = { ...ctxOf(), rng: fixedRng(0.01) };
    expect(rollRisks(fatal, { attack: 100, revolution: 100, coup: 100, rebels: 0 }).map((e) => e.id)).toEqual(["attack-fatal"]);
    expect(fatal.state.defeat).toBe("attack");
    const coup = { ...ctxOf(), rng: fixedRng(0.01) };
    expect(rollRisks(coup, { attack: 0, revolution: 0, coup: 50, rebels: 0 }).map((e) => e.id)).toEqual(["coup"]);
    const revolution = { ...ctxOf(), rng: fixedRng(0.01) };
    rollRisks(revolution, { attack: 0, revolution: 50, coup: 50, rebels: 0 });
    expect(revolution.state.defeat).toBe("revolution");
  });
});

describe("grupos emergentes", () => {
  it("revolucionários crescem com aprovação baixa; rebeldes com recessão ≥ 2", () => {
    const ctx = ctxOf();
    ctx.state.approval = 20;
    expect(revolutionaryGrowth(ctx)).toBeCloseTo(0.3);
    ctx.state.recessionLevel = 2;
    expect(rebelGrowth(ctx)).toBe(0.5);
    ctx.state.activeNodes = ["military-on-streets"];
    expect(rebelGrowth(ctx)).toBe(0.25);
  });

  it("`rebels-emerge` só na primeira vez", () => {
    const ctx = ctxOf();
    ctx.state.recessionLevel = 3;
    expect(updateEmergent(ctx).map((e) => e.id)).toEqual(["rebels-emerge"]);
    expect(updateEmergent(ctx)).toEqual([]);
    expect(groupOf(ctx.state, "rebels")?.size).toBe(2);
  });
});

describe("fila", () => {
  it("valida pré-requisito, opostas, duplicata, impostos, máximo de ações e capital", () => {
    const codes = (queue: string[], capital = 1000) => {
      const s = game();
      s.capital = capital;
      s.queue = queue;
      return validateQueue(ctxOf(s)).map((e) => e.code);
    };
    expect(codes(["harsher-sentences"])).toEqual([]);
    expect(codes(["carry-restriction"])).toEqual(["unavailable"]);
    expect(codes(["mandatory-registration", "easier-registration"])).toEqual(["unavailable", "unavailable"]);
    expect(codes(["harsher-sentences", "harsher-sentences"])).toEqual(["duplicate"]);
    expect(codes(["taxes-40"])).toEqual(["unavailable"]);
    const seven = ["harsher-sentences", "secret-police", "privatizations", "outsourcing", "emission-targets", "easier-visas", "state-lottery"];
    expect(codes(seven)).toEqual(["tooManyActions"]);
    expect(codes(["harsher-sentences"], 10)).toEqual(["insufficientCapital"]);
    const sameRate = game();
    sameRate.queuedTaxRate = 30;
    expect(validateQueue(ctxOf(sameRate))).toEqual([{ code: "unavailable", nodeId: "taxes" }]);
  });

  it("ajuste de alíquota custa capital, conta como ação e mexe com quem não gosta de imposto", () => {
    const ctx = ctxOf();
    ctx.state.queuedTaxRate = 40;
    expect(queueTotalCost(ctx)).toBe(20);
    applyQueue(ctx);
    expect(ctx.state.taxRate).toBe(40);
    expect(ctx.state.capital).toBe(40);
    expect(groupOf(ctx.state, "business")?.support).toBe(46);
    ctx.state.queuedTaxRate = 30;
    applyQueue(ctx);
    expect(groupOf(ctx.state, "business")?.support).toBe(50);
  });

  it("ativar nó move apoio e memória dos grupos e aplica `tam` na ativação", () => {
    const ctx = ctxOf();
    ctx.state.capital = 1000;
    ctx.state.activeNodes = ["immigration-quotas", "border-wall"];
    ctx.state.queue = ["mass-deportation"];
    expect(applyQueue(ctx)).toEqual(["mass-deportation"]);
    expect(groupOf(ctx.state, "nationalists")).toMatchObject({ support: 54, memory: "mass-deportation" });
    expect(groupOf(ctx.state, "immigrants")).toMatchObject({ support: 46, size: 2 });
    expect(ctx.state.queue).toEqual([]);
  });
});

describe("efeitos de evento", () => {
  it("choque na base, dívida no estoque, mídia amplia negativos e capital não fica negativo", () => {
    const ctx = ctxOf();
    ctx.state.actors.media = "hostile";
    applyEventEffects(ctx.state, {
      indicators: { gdp: -1, debt: 5 }, allGroups: -1, groups: [{ groupId: "workers", delta: 2 }],
      sizes: [{ groupId: "rebels", delta: 1 }], military: 5, risks: { coup: 2 }, capital: -100, crisis: true,
    });
    expect(ctx.state.base.gdp).toBeCloseTo(0.8);
    expect(ctx.state.indicators.debt).toBe(79);
    expect(groupOf(ctx.state, "religious")?.support).toBeCloseTo(48.6);
    expect(groupOf(ctx.state, "workers")?.support).toBeCloseTo(50.6);
    expect(groupOf(ctx.state, "rebels")?.size).toBe(1);
    expect(ctx.state.moodMods.military).toBe(5);
    expect(ctx.state.eventRisks.coup).toBe(2);
    expect(ctx.state.capital).toBe(0);
    expect(ctx.state.lastCrisisTurn).toBe(1);
  });

  it("`rev` nos eventos é tamanho de revolucionários, não risco", () => {
    const ctx = ctxOf();
    const wrongful = defaultContent.events.find((e) => e.id === "wrongful-execution");
    if (wrongful) applyEventEffects(ctx.state, wrongful.effects);
    expect(groupOf(ctx.state, "revolutionaries")?.size).toBe(0.5);
    expect(ctx.state.eventRisks.revolution).toBeUndefined();
  });
});

describe("rng", () => {
  it("uniforme em [0, 1) e normal com média ~0", () => {
    const rng = createRng(123);
    const uniforms = Array.from({ length: 2000 }, () => rng.next());
    expect(Math.min(...uniforms)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...uniforms)).toBeLessThan(1);
    const normals = Array.from({ length: 2000 }, () => rng.normal());
    expect(Math.abs(normals.reduce((a, b) => a + b, 0) / normals.length)).toBeLessThan(0.1);
  });
});
