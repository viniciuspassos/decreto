import type { ActorMood, IndicatorId, RiskId } from "@decreto/shared-types";
import type { FieldId } from "./policy-trees.js";

export type ConditionType =
  | "nodeActive"
  | "anyNodeActive"
  | "taxRateAtLeast"
  | "taxRateAtMost"
  | "indicatorAbove"
  | "indicatorBelow"
  | "approvalAbove"
  | "approvalBelow"
  | "groupSupportBelow"
  | "militaryMoodIn"
  | "recessionAtLeast"
  | "always";

/** Uma condição de gatilho (game-design §4.2). Várias condições num gatilho são combinadas com AND. */
export interface Condition {
  type: ConditionType;
  nodeId?: string;
  nodeIds?: string[];
  indicatorId?: IndicatorId;
  threshold?: number;
  groupId?: string;
  moods?: ActorMood[];
}

/** Escala o peso pela distância do indicador a um limiar: `min(3, 1 + |valor-limiar|/faixa)`. */
export interface IndicatorScale {
  indicatorId: IndicatorId;
  threshold: number;
  range: number;
}

/** Multiplicador extra só aplicado se a condição for satisfeita (ex.: ×1,5 se Imp > 40). */
export interface ConditionalMultiplier {
  condition: Condition;
  factor: number;
}

export interface EventTrigger {
  /** Todas devem ser verdadeiras (AND). Vários gatilhos no mesmo evento são alternativos (OR, vale o maior peso). */
  conditions: Condition[];
  weight: number;
  scale?: IndicatorScale;
  conditionalMultiplier?: ConditionalMultiplier;
}

export interface GroupDelta {
  groupId: string;
  delta: number;
}

/** Esquema comum a efeito base e a cada opção de escolha (game-design §4.5). */
export interface EventEffects {
  indicators?: Partial<Record<IndicatorId, number>>;
  groups?: GroupDelta[];
  /** Delta de apoio para todos os grupos não emergentes. */
  allGroups?: number;
  sizes?: GroupDelta[];
  media?: number;
  military?: number;
  risks?: Partial<Record<RiskId, number>>;
  capital?: number;
  crisis?: boolean;
}

export interface EventOption {
  effects: EventEffects;
}

export type EventTone = "positive" | "negative" | "mixed";

export interface GameEventDefinition {
  id: string;
  field: FieldId | "none";
  tone: EventTone;
  triggers: EventTrigger[];
  /** Turnos até poder sair de novo; "once" = uma vez por partida. */
  cooldown: number | "once";
  /** ★ no catálogo: no máx. 1 por semestre mostra imagem. */
  milestone?: boolean;
  /** ⚑ no catálogo: liga a flag de crise ao ocorrer. */
  crisis?: boolean;
  effects: EventEffects;
  options?: { a: EventOption; b: EventOption };
  /** Nunca sorteado enquanto este nó estiver ativo (ex.: `corruption-scoop` × `censorship`). */
  blockedByNode?: string;
}

const node = (nodeId: string, weight: number): EventTrigger => ({ conditions: [{ type: "nodeActive", nodeId }], weight });
const anyNode = (nodeIds: string[], weight: number): EventTrigger => ({ conditions: [{ type: "anyNodeActive", nodeIds }], weight });
const always = (weight: number): EventTrigger => ({ conditions: [{ type: "always" }], weight });

export const events: GameEventDefinition[] = [
  // Segurança (9)
  {
    id: "buyback-record", field: "security", tone: "positive", cooldown: 8,
    triggers: [node("gun-buyback", 4)],
    effects: { indicators: { crime: -2 }, groups: [{ groupId: "progressives", delta: 3 }, { groupId: "middle-class", delta: 2 }, { groupId: "gun-owners", delta: -3 }], media: 5 },
  },
  {
    id: "school-shooting", field: "security", tone: "negative", cooldown: 6, milestone: true,
    triggers: [node("free-carry", 5), node("legal-militias", 7)],
    effects: { indicators: { crime: 2 }, allGroups: -1, groups: [{ groupId: "progressives", delta: -5 }, { groupId: "middle-class", delta: -3 }], media: -10 },
    options: {
      a: { effects: { groups: [{ groupId: "gun-owners", delta: 4 }, { groupId: "agribusiness", delta: 2 }, { groupId: "progressives", delta: -4 }] } },
      b: { effects: { capital: -10, indicators: { crime: -1 }, groups: [{ groupId: "gun-owners", delta: -6 }, { groupId: "progressives", delta: 3 }, { groupId: "middle-class", delta: 2 }] } },
    },
  },
  {
    id: "militia-takes-district", field: "security", tone: "negative", cooldown: 6,
    triggers: [node("legal-militias", 6)],
    effects: { indicators: { crime: 4, corruption: 2 }, groups: [{ groupId: "poor", delta: -5 }, { groupId: "middle-class", delta: -3 }], military: -10 },
  },
  {
    id: "military-abuse-viral", field: "security", tone: "negative", cooldown: 6,
    triggers: [{ conditions: [{ type: "nodeActive", nodeId: "military-on-streets" }], weight: 5, conditionalMultiplier: { condition: { type: "indicatorAbove", indicatorId: "pressFreedom", threshold: 40 }, factor: 1.5 } }],
    effects: { groups: [{ groupId: "youth", delta: -5 }, { groupId: "progressives", delta: -5 }, { groupId: "poor", delta: -3 }], media: -10 },
    options: {
      a: { effects: { groups: [{ groupId: "security-forces", delta: 6 }, { groupId: "youth", delta: -3 }, { groupId: "progressives", delta: -3 }], military: 10 } },
      b: { effects: { groups: [{ groupId: "security-forces", delta: -6 }, { groupId: "progressives", delta: 3 }], military: -10, media: 10 } },
    },
  },
  {
    id: "wrongful-execution", field: "security", tone: "negative", cooldown: 10, milestone: true,
    triggers: [node("death-penalty", 4)],
    effects: { allGroups: -1, groups: [{ groupId: "progressives", delta: -6 }, { groupId: "religious", delta: -4 }], media: -15, sizes: [{ groupId: "revolutionaries", delta: 0.5 }] },
  },
  {
    id: "journalist-disappears", field: "security", tone: "negative", cooldown: 6,
    triggers: [node("opposition-surveillance", 5), node("arrest-opponents", 7)],
    effects: { indicators: { pressFreedom: -2 }, groups: [{ groupId: "progressives", delta: -5 }, { groupId: "youth", delta: -3 }], media: -15, sizes: [{ groupId: "revolutionaries", delta: 0.5 }] },
  },
  {
    id: "organized-crime-wave", field: "security", tone: "negative", cooldown: 4,
    triggers: [{ conditions: [{ type: "indicatorAbove", indicatorId: "crime", threshold: 55 }], weight: 3, scale: { indicatorId: "crime", threshold: 55, range: 15 } }],
    effects: { indicators: { crime: 3, gdp: -0.2 }, groups: [{ groupId: "middle-class", delta: -4 }, { groupId: "business", delta: -2 }] },
  },
  {
    id: "coup-rumors", field: "security", tone: "negative", cooldown: 4,
    triggers: [{ conditions: [{ type: "militaryMoodIn", moods: ["critical", "hostile"] }], weight: 5 }],
    effects: { risks: { coup: 3 } },
    options: {
      a: { effects: { risks: { coup: -6 }, groups: [{ groupId: "security-forces", delta: -8 }], indicators: { pressFreedom: -1 } } },
      b: { effects: { indicators: { debt: 1.5 }, groups: [{ groupId: "security-forces", delta: 5 }], military: 15 } },
    },
  },
  {
    id: "police-strike", field: "security", tone: "negative", cooldown: 6,
    triggers: [{ conditions: [{ type: "groupSupportBelow", groupId: "security-forces", threshold: 35 }], weight: 4 }, { conditions: [{ type: "indicatorAbove", indicatorId: "debt", threshold: 120 }], weight: 4 }],
    effects: { indicators: { crime: 3 }, groups: [{ groupId: "middle-class", delta: -3 }] },
    options: {
      a: { effects: { indicators: { debt: 1 }, groups: [{ groupId: "security-forces", delta: 8 }], military: 5 } },
      b: { effects: { indicators: { crime: 2 }, groups: [{ groupId: "security-forces", delta: -6 }], military: -5 } },
    },
  },

  // Economia (9)
  {
    id: "shortages", field: "economy", tone: "negative", cooldown: 4,
    triggers: [node("price-controls", 6)],
    effects: { indicators: { inflation: 1.0, gdp: -0.3 }, groups: [{ groupId: "poor", delta: -4 }, { groupId: "middle-class", delta: -4 }, { groupId: "retirees", delta: -2 }] },
  },
  {
    id: "capital-flight", field: "economy", tone: "negative", cooldown: 6,
    triggers: [{ conditions: [{ type: "taxRateAtLeast", threshold: 60 }], weight: 4 }, node("sector-nationalization", 5), node("end-private-property", 7)],
    effects: { indicators: { gdp: -0.6, unemployment: 0.4, debt: 2 }, groups: [{ groupId: "business", delta: -5 }, { groupId: "rich", delta: -6 }], sizes: [{ groupId: "rich", delta: -0.3 }] },
  },
  {
    id: "investment-boom", field: "economy", tone: "positive", cooldown: 6,
    triggers: [{ conditions: [{ type: "taxRateAtMost", threshold: 20 }], weight: 3, conditionalMultiplier: { condition: { type: "indicatorAbove", indicatorId: "corruption", threshold: 55 }, factor: 0.5 } }, node("privatizations", 4), node("deregulation", 4)],
    effects: { indicators: { gdp: 0.6, unemployment: -0.4 }, groups: [{ groupId: "business", delta: 5 }, { groupId: "rich", delta: 3 }, { groupId: "youth", delta: 2 }] },
  },
  {
    id: "credit-downgrade", field: "economy", tone: "negative", cooldown: 6,
    triggers: [{ conditions: [{ type: "indicatorAbove", indicatorId: "debt", threshold: 90 }], weight: 4, scale: { indicatorId: "debt", threshold: 90, range: 40 } }],
    effects: { indicators: { debt: 2, gdp: -0.3, inflation: 0.5 }, groups: [{ groupId: "business", delta: -4 }, { groupId: "middle-class", delta: -2 }], media: -5 },
  },
  {
    id: "currency-crisis", field: "economy", tone: "negative", cooldown: 8, milestone: true, crisis: true,
    triggers: [{ conditions: [{ type: "indicatorAbove", indicatorId: "inflation", threshold: 15 }], weight: 4 }, { conditions: [{ type: "indicatorAbove", indicatorId: "debt", threshold: 130 }], weight: 4 }],
    effects: { indicators: { inflation: 4, gdp: -0.6 }, allGroups: -2, groups: [{ groupId: "retirees", delta: -4 }, { groupId: "middle-class", delta: -3 }], crisis: true },
  },
  {
    id: "commodity-boom", field: "economy", tone: "positive", cooldown: 8,
    triggers: [always(1), anyNode(["easier-environmental-licenses", "mining-in-reserves", "end-environmental-laws"], 2)],
    effects: { indicators: { gdp: 0.8, unemployment: -0.3, debt: -2 }, groups: [{ groupId: "agribusiness", delta: 5 }] },
  },
  {
    id: "commodity-crash", field: "economy", tone: "negative", cooldown: 8,
    triggers: [always(1), anyNode(["easier-environmental-licenses", "mining-in-reserves", "end-environmental-laws"], 2)],
    effects: { indicators: { gdp: -0.8, unemployment: 0.3, debt: 2 }, groups: [{ groupId: "agribusiness", delta: -5 }, { groupId: "workers", delta: -2 }] },
  },
  {
    id: "global-recession", field: "economy", tone: "negative", cooldown: 12, crisis: true,
    triggers: [always(0.8)],
    effects: { indicators: { gdp: -1.0, unemployment: 0.6 }, allGroups: -1, crisis: true },
  },
  {
    id: "good-harvest", field: "economy", tone: "positive", cooldown: 4,
    triggers: [always(2)],
    effects: { indicators: { inflation: -0.8, gdp: 0.2 }, groups: [{ groupId: "agribusiness", delta: 4 }, { groupId: "poor", delta: 2 }] },
  },

  // Trabalho (2)
  {
    id: "general-strike", field: "labor", tone: "negative", cooldown: 6, milestone: true,
    triggers: [node("labor-reform", 4), { conditions: [{ type: "indicatorAbove", indicatorId: "inflation", threshold: 12 }], weight: 4 }, node("end-minimum-wage", 5), node("strike-ban", 5)],
    effects: { indicators: { gdp: -0.5 }, groups: [{ groupId: "business", delta: -3 }, { groupId: "middle-class", delta: -2 }] },
    options: {
      a: { effects: { capital: -10, indicators: { inflation: 0.5 }, groups: [{ groupId: "workers", delta: 6 }, { groupId: "retirees", delta: 2 }, { groupId: "business", delta: -4 }] } },
      b: { effects: { indicators: { pressFreedom: -2 }, groups: [{ groupId: "workers", delta: -8 }, { groupId: "youth", delta: -4 }, { groupId: "security-forces", delta: 3 }], military: 5, sizes: [{ groupId: "revolutionaries", delta: 0.5 }] } },
    },
  },
  {
    id: "union-agreement", field: "labor", tone: "positive", cooldown: 8,
    triggers: [{ conditions: [{ type: "nodeActive", nodeId: "minimum-wage-raise" }], weight: 4, conditionalMultiplier: { condition: { type: "indicatorAbove", indicatorId: "inflation", threshold: 10 }, factor: 0.5 } }],
    effects: { indicators: { inflation: 0.2, gdp: 0.1 }, groups: [{ groupId: "workers", delta: 5 }, { groupId: "business", delta: -1 }] },
  },

  // Saúde (3)
  {
    id: "hospital-queue-scandal", field: "health", tone: "negative", cooldown: 4,
    triggers: [node("private-partnerships", 4), { conditions: [{ type: "indicatorBelow", indicatorId: "health", threshold: 45 }], weight: 4, scale: { indicatorId: "health", threshold: 45, range: 15 } }],
    effects: { indicators: { health: -1 }, groups: [{ groupId: "poor", delta: -5 }, { groupId: "retirees", delta: -5 }], media: -5 },
  },
  {
    id: "epidemic", field: "health", tone: "negative", cooldown: 10, milestone: true, crisis: true,
    triggers: [always(0.5), { conditions: [{ type: "indicatorBelow", indicatorId: "health", threshold: 40 }], weight: 3, scale: { indicatorId: "health", threshold: 40, range: 15 } }],
    effects: { indicators: { health: -5, gdp: -0.5 }, allGroups: -1, crisis: true },
    options: {
      a: { effects: { indicators: { gdp: -0.6, health: 3 }, groups: [{ groupId: "business", delta: -5 }, { groupId: "youth", delta: -3 }, { groupId: "retirees", delta: 3 }] } },
      b: { effects: { indicators: { health: -4 }, groups: [{ groupId: "retirees", delta: -6 }, { groupId: "poor", delta: -3 }, { groupId: "business", delta: 3 }] } },
    },
  },
  {
    id: "medical-breakthrough", field: "health", tone: "positive", cooldown: 8,
    triggers: [node("public-network-expansion", 3), { conditions: [{ type: "indicatorAbove", indicatorId: "health", threshold: 65 }], weight: 3 }],
    effects: { indicators: { health: 3 }, groups: [{ groupId: "retirees", delta: 4 }, { groupId: "poor", delta: 2 }], media: 5 },
  },

  // Educação (2)
  {
    id: "school-ranking-record", field: "education", tone: "positive", cooldown: 6,
    triggers: [node("free-university", 4), { conditions: [{ type: "indicatorAbove", indicatorId: "education", threshold: 65 }], weight: 4 }],
    effects: { indicators: { education: 2 }, groups: [{ groupId: "youth", delta: 4 }, { groupId: "middle-class", delta: 2 }], media: 5 },
  },
  {
    id: "student-protests", field: "education", tone: "negative", cooldown: 4,
    triggers: [
      { conditions: [{ type: "indicatorAbove", indicatorId: "education", threshold: 60 }, { type: "indicatorBelow", indicatorId: "pressFreedom", threshold: 40 }], weight: 3 },
      node("state-indoctrination", 5), node("party-youth", 6),
    ],
    effects: { groups: [{ groupId: "youth", delta: -5 }, { groupId: "progressives", delta: -3 }] },
    options: {
      a: { effects: { capital: -10, groups: [{ groupId: "youth", delta: 4 }] } },
      b: { effects: { indicators: { pressFreedom: -2 }, groups: [{ groupId: "youth", delta: -6 }, { groupId: "security-forces", delta: 3 }], sizes: [{ groupId: "revolutionaries", delta: 1 }], media: -10 } },
    },
  },

  // Costumes (4)
  {
    id: "religious-march", field: "customs", tone: "mixed", cooldown: 6,
    triggers: [node("same-sex-marriage", 3), node("legal-abortion", 5), node("all-drugs-legalization", 5)],
    effects: { groups: [{ groupId: "religious", delta: -4 }, { groupId: "nationalists", delta: -2 }, { groupId: "progressives", delta: 2 }] },
  },
  {
    id: "overdose-crisis", field: "customs", tone: "negative", cooldown: 6,
    triggers: [node("all-drugs-legalization", 5)],
    effects: { indicators: { health: -3, crime: 1 }, groups: [{ groupId: "middle-class", delta: -4 }, { groupId: "religious", delta: -4 }, { groupId: "retirees", delta: -2 }] },
  },
  {
    id: "morality-police-incident", field: "customs", tone: "negative", cooldown: 6, milestone: true,
    triggers: [node("official-religion", 2), node("religious-law", 6)],
    effects: { indicators: { pressFreedom: -2 }, groups: [{ groupId: "youth", delta: -6 }, { groupId: "progressives", delta: -8 }, { groupId: "religious", delta: 3 }], sizes: [{ groupId: "revolutionaries", delta: 0.5 }], media: -10 },
  },
  {
    id: "casino-laundering-scandal", field: "customs", tone: "negative", cooldown: 6,
    triggers: [node("online-betting", 2), node("casinos-allowed", 5)],
    effects: { indicators: { corruption: 4 }, groups: [{ groupId: "religious", delta: -5 }, { groupId: "middle-class", delta: -3 }], media: -5 },
  },

  // Meio ambiente (4)
  {
    id: "environmental-disaster", field: "environment", tone: "negative", cooldown: 6, milestone: true,
    triggers: [{ conditions: [{ type: "indicatorAbove", indicatorId: "pollution", threshold: 65 }], weight: 3 }, node("mining-in-reserves", 5), node("end-environmental-laws", 7)],
    effects: { indicators: { pollution: 5, health: -2, gdp: -0.2 }, groups: [{ groupId: "environmentalists", delta: -8 }, { groupId: "progressives", delta: -3 }] },
    options: {
      a: { effects: { capital: -10, indicators: { corruption: -2 }, groups: [{ groupId: "business", delta: -4 }, { groupId: "agribusiness", delta: -4 }, { groupId: "environmentalists", delta: 4 }] } },
      b: { effects: { indicators: { corruption: 2 }, groups: [{ groupId: "environmentalists", delta: -5 }], media: -10 } },
    },
  },
  {
    id: "energy-crisis", field: "environment", tone: "negative", cooldown: 6, crisis: true,
    triggers: [node("mandatory-degrowth", 4), node("end-fossil-fuels", 6)],
    effects: { indicators: { inflation: 1.5, gdp: -0.4 }, groups: [{ groupId: "middle-class", delta: -3 }, { groupId: "business", delta: -3 }], crisis: true },
    options: {
      a: { effects: { indicators: { pollution: 4 }, groups: [{ groupId: "environmentalists", delta: -6 }, { groupId: "progressives", delta: -2 }] } },
      b: { effects: { indicators: { gdp: -0.5 }, groups: [{ groupId: "business", delta: -4 }, { groupId: "middle-class", delta: -2 }, { groupId: "environmentalists", delta: 2 }] } },
    },
  },
  {
    id: "climate-award", field: "environment", tone: "positive", cooldown: 8,
    triggers: [{ conditions: [{ type: "indicatorBelow", indicatorId: "pollution", threshold: 30 }], weight: 3 }, node("reserve-protection", 4)],
    effects: { indicators: { gdp: 0.2 }, groups: [{ groupId: "environmentalists", delta: 5 }, { groupId: "progressives", delta: 3 }], media: 5 },
  },
  {
    id: "natural-disaster", field: "environment", tone: "negative", cooldown: 6, milestone: true, crisis: true,
    triggers: [always(1.5), { conditions: [{ type: "indicatorAbove", indicatorId: "pollution", threshold: 60 }], weight: 3 }],
    effects: { indicators: { gdp: -0.4, health: -2, debt: 1.5 }, allGroups: -1, groups: [{ groupId: "poor", delta: -3 }], crisis: true },
  },

  // Imigração (2)
  {
    id: "migration-wave", field: "immigration", tone: "mixed", cooldown: 6,
    triggers: [node("easier-visas", 1.5), node("open-borders", 5)],
    effects: { indicators: { gdp: 0.2, unemployment: 0.3 }, sizes: [{ groupId: "immigrants", delta: 1 }], groups: [{ groupId: "nationalists", delta: -6 }, { groupId: "immigrants", delta: 4 }, { groupId: "workers", delta: -2 }] },
  },
  {
    id: "labor-shortage", field: "immigration", tone: "negative", cooldown: 6,
    triggers: [node("immigration-quotas", 2), node("mass-deportation", 6)],
    effects: { indicators: { gdp: -0.4, inflation: 0.5 }, groups: [{ groupId: "agribusiness", delta: -6 }, { groupId: "business", delta: -4 }] },
  },

  // Imprensa e liberdades (2)
  {
    id: "hacker-leak", field: "press", tone: "negative", cooldown: 6,
    triggers: [{ conditions: [{ type: "nodeActive", nodeId: "internet-monitoring" }], weight: 4, conditionalMultiplier: { condition: { type: "nodeActive", nodeId: "thought-police" }, factor: 1.5 } }, node("censorship", 4)],
    effects: { indicators: { pressFreedom: 2 }, allGroups: -1, groups: [{ groupId: "youth", delta: -4 }, { groupId: "progressives", delta: -3 }], media: -10 },
  },
  {
    id: "corruption-scoop", field: "press", tone: "negative", cooldown: 4, blockedByNode: "censorship",
    triggers: [{ conditions: [{ type: "indicatorAbove", indicatorId: "corruption", threshold: 50 }], weight: 4, scale: { indicatorId: "corruption", threshold: 50, range: 20 } }],
    effects: { groups: [{ groupId: "middle-class", delta: -4 }, { groupId: "youth", delta: -3 }, { groupId: "progressives", delta: -3 }], media: -10 },
    options: {
      a: { effects: { capital: -10, indicators: { corruption: -3 }, groups: [{ groupId: "middle-class", delta: 2 }] } },
      b: { effects: { indicators: { corruption: 1 }, allGroups: -1, media: -10 } },
    },
  },

  // Poder e regime (6)
  {
    id: "judges-resign", field: "power", tone: "negative", cooldown: "once",
    triggers: [node("judiciary-control", 5)],
    effects: { indicators: { gdp: -0.2, pressFreedom: -2, corruption: 2 }, groups: [{ groupId: "progressives", delta: -5 }, { groupId: "business", delta: -3 }], media: -10 },
  },
  {
    id: "leader-statue-toppled", field: "power", tone: "negative", cooldown: 6, milestone: true,
    triggers: [{ conditions: [{ type: "nodeActive", nodeId: "mandatory-portraits" }, { type: "approvalBelow", threshold: 40 }], weight: 6 }],
    effects: { allGroups: -1, groups: [{ groupId: "nationalists", delta: -3 }], sizes: [{ groupId: "revolutionaries", delta: 1 }], risks: { coup: 2 }, media: -5 },
  },
  {
    id: "mass-rally", field: "power", tone: "positive", cooldown: 4,
    triggers: [
      { conditions: [{ type: "nodeActive", nodeId: "government-propaganda" }, { type: "approvalAbove", threshold: 50 }], weight: 4 },
      { conditions: [{ type: "nodeActive", nodeId: "mandatory-portraits" }, { type: "approvalAbove", threshold: 50 }], weight: 5 },
    ],
    effects: { allGroups: 1, groups: [{ groupId: "nationalists", delta: 4 }], media: 5 },
  },
  {
    id: "palace-intrigue", field: "power", tone: "negative", cooldown: 6,
    triggers: [node("succession", 2), node("coronation", 4)],
    effects: { indicators: { corruption: 1 }, military: -10, risks: { coup: 3 } },
  },
  {
    id: "international-sanctions", field: "power", tone: "negative", cooldown: 8, milestone: true,
    triggers: [node("arrest-opponents", 2), node("mass-deportation", 4), node("torture", 5), node("end-of-elections", 5), node("opponent-assassination", 6)],
    effects: { indicators: { gdp: -0.6, inflation: 0.5, debt: 1 }, groups: [{ groupId: "business", delta: -4 }, { groupId: "rich", delta: -3 }, { groupId: "nationalists", delta: 3 }] },
    options: {
      a: { effects: { indicators: { gdp: -0.3 }, groups: [{ groupId: "nationalists", delta: 4 }, { groupId: "progressives", delta: -3 }] } },
      b: { effects: { indicators: { gdp: 0.4 }, groups: [{ groupId: "nationalists", delta: -3 }, { groupId: "security-forces", delta: -4 }], sizes: [{ groupId: "revolutionaries", delta: 1 }], media: 5 } },
    },
  },
  {
    id: "mass-protests", field: "power", tone: "negative", cooldown: 4, milestone: true,
    triggers: [
      { conditions: [{ type: "approvalBelow", threshold: 30 }], weight: 4 },
      { conditions: [{ type: "nodeActive", nodeId: "rule-by-decree" }, { type: "approvalBelow", threshold: 45 }], weight: 4, conditionalMultiplier: { condition: { type: "nodeActive", nodeId: "state-of-emergency" }, factor: 1.5 } },
    ],
    effects: { indicators: { crime: 2 }, allGroups: -1, sizes: [{ groupId: "revolutionaries", delta: 1 }] },
    options: {
      a: { effects: { capital: -15, allGroups: 2 } },
      b: { effects: { indicators: { pressFreedom: -3 }, groups: [{ groupId: "security-forces", delta: 4 }], military: 5, sizes: [{ groupId: "revolutionaries", delta: 1.5 }], media: -10 } },
    },
  },

  // Estado do país, sem política (2)
  {
    id: "sports-victory", field: "none", tone: "positive", cooldown: 10,
    triggers: [always(1.5)],
    effects: { allGroups: 2, groups: [{ groupId: "nationalists", delta: 2 }] },
  },
  {
    id: "infrastructure-collapse", field: "none", tone: "negative", cooldown: 6,
    triggers: [always(0.8), { conditions: [{ type: "indicatorAbove", indicatorId: "debt", threshold: 100 }], weight: 2.5 }, node("minimal-state", 3)],
    effects: { indicators: { health: -1, gdp: -0.2, corruption: 1 }, allGroups: -2, media: -5 },
  },
];

/** Eventos gerados pelo motor (não sorteados, não contam na cota do semestre; game-design §5.2). */
export interface SystemEventDefinition {
  id: string;
  milestone?: boolean;
  crisis?: boolean;
  effects?: EventEffects;
}

export const systemEvents: SystemEventDefinition[] = [
  { id: "attack-foiled", milestone: true, crisis: true, effects: { allGroups: 3, media: 10 } },
  { id: "attack-fatal", milestone: true },
  { id: "coup", milestone: true },
  { id: "revolution", milestone: true },
  { id: "rebels-emerge" },
  { id: "recession-starts" },
  { id: "recession-ends" },
];
