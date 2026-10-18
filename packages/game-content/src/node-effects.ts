import { TAX_RATES } from "./rules.js";

/** Efeito de tamanho de grupo aplicado uma vez, no semestre de ativação do nó. */
export interface GroupSizeOnceEffect {
  groupId: string;
  /** Multiplica o tamanho atual do grupo (ex.: 0,5 = reduz à metade). */
  multiplier: number;
}

/** Efeito de tamanho de grupo aplicado a cada semestre enquanto o nó está ativo. */
export interface GroupSizePerSemesterEffect {
  groupId: string;
  delta: number;
  /** Teto de tamanho (%) acima do qual o efeito não se aplica mais. */
  cap?: number;
}

/**
 * Efeito de um nó (ou alíquota de imposto) sobre indicadores e modificadores (game-design §1.6, §2).
 * Todos os campos são incrementais e somam-se aos de outros nós ativos. Dois mecanismos citados no
 * catálogo (`ate×0,7` em `secret-police`/`mass-surveillance`, `rebeldes×0,5` em
 * `military-on-streets`/`mass-surveillance`, redução de letalidade de atentado nesses três nós) são
 * hardcoded no motor por id (game-design §3.7–§3.8), não dados aqui.
 */
export interface NodeEffect {
  gdp?: number;
  unemployment?: number;
  inflation?: number;
  crime?: number;
  health?: number;
  education?: number;
  pollution?: number;
  pressFreedom?: number;
  corruption?: number;
  /** Soma ao déficit primário a cada semestre em que o nó está ativo (pp do PIB). */
  debtPerSemester?: number;
  /** Soma uma única vez, no semestre de ativação. */
  debtOnce?: number;
  /** Humor militar (escore). */
  military?: number;
  /** Humor da mídia (escore). */
  media?: number;
  /** pp somados ao risco de golpe do semestre. */
  coupRisk?: number;
  /** pp somados ao risco de tentativa de atentado do semestre. */
  attackRisk?: number;
  /** pp somados ao risco de revolução do semestre. */
  revolutionRisk?: number;
  /** pp de crescimento de `revolutionaries` por semestre. */
  revolutionaryGrowth?: number;
  /** Pontos somados à âncora de apoio de todos os grupos. */
  supportAnchor?: number;
  groupSizeOnce?: GroupSizeOnceEffect[];
  groupSizePerSemester?: GroupSizePerSemesterEffect[];
}

/**
 * Efeito de cada um dos 99 nós (game-design §2). Os 6 nós da árvore `taxes` não entram aqui:
 * seu efeito depende da alíquota corrente (`taxRateEffects`, abaixo), não do nó em si.
 */
export const nodeEffects: Record<string, NodeEffect> = {
  // Segurança
  "mandatory-registration": { crime: -2, corruption: -1 },
  "carry-restriction": { crime: -3 },
  "gun-buyback": { crime: -3, debtOnce: 2 },
  "total-gun-ban": { crime: -3, corruption: 2, attackRisk: -2 },
  "easier-registration": { crime: 1, corruption: -1 },
  "citizen-carry": { crime: 2, attackRisk: 1 },
  "free-carry": { crime: 3, attackRisk: 1 },
  "legal-militias": { crime: 4, pressFreedom: -2, corruption: 3, military: -15, coupRisk: -5, revolutionRisk: -4, attackRisk: 2 },
  "harsher-sentences": { crime: -2, debtPerSemester: 0.3, military: 5 },
  "military-on-streets": { crime: -5, pressFreedom: -2, corruption: 1, debtPerSemester: 0.5, military: 10, revolutionRisk: -2 },
  "life-sentence": { crime: -2, debtPerSemester: 0.3 },
  "death-penalty": { crime: -3, pressFreedom: -2, military: 5, media: -10, revolutionaryGrowth: 0.1 },
  "secret-police": { pressFreedom: -4, corruption: 2, debtPerSemester: 0.2, military: 5, coupRisk: -2, revolutionRisk: -2 },
  "opposition-surveillance": { pressFreedom: -6, corruption: 1, media: -10, revolutionRisk: -3, attackRisk: -1, revolutionaryGrowth: 0.1 },
  "arrest-opponents": { pressFreedom: -10, corruption: 2, media: -15, revolutionRisk: -5, coupRisk: -1, revolutionaryGrowth: 0.2 },
  torture: { crime: -1, pressFreedom: -6, corruption: 3, media: -15, revolutionRisk: -3, attackRisk: 2, revolutionaryGrowth: 0.3 },
  "opponent-assassination": { pressFreedom: -8, corruption: 3, media: -20, military: -5, revolutionRisk: -6, attackRisk: 4, revolutionaryGrowth: 0.4 },

  // Economia
  "strategic-state-company": { gdp: 0.2, unemployment: -0.5, corruption: 2, debtPerSemester: 0.3, debtOnce: 3 },
  "price-controls": { gdp: -0.4, inflation: -3.0, corruption: 1 },
  "sector-nationalization": { gdp: -0.6, unemployment: -1.0, corruption: 3, debtPerSemester: 0.6, debtOnce: 8 },
  "end-private-property": {
    gdp: -2.0, unemployment: -2.5, inflation: 4.0, pressFreedom: -5, corruption: 5, debtPerSemester: 1.0,
    military: -10, revolutionaryGrowth: 0.2,
    groupSizeOnce: [{ groupId: "rich", multiplier: 0.5 }, { groupId: "business", multiplier: 0.5 }],
  },
  privatizations: { gdp: 0.4, unemployment: 0.5, corruption: 1, debtPerSemester: -0.2, debtOnce: -6 },
  deregulation: { gdp: 0.6, pollution: 3, corruption: 2 },
  "end-minimum-wage": {
    gdp: 0.4, unemployment: -1.2, inflation: -0.5, crime: 2, health: -2, revolutionaryGrowth: 0.1,
    groupSizePerSemester: [{ groupId: "poor", delta: 0.15 }],
  },
  "minimal-state": {
    gdp: 0.8, crime: 3, health: -6, education: -6, debtPerSemester: -1.5, military: -10,
    groupSizePerSemester: [{ groupId: "poor", delta: 0.2 }],
  },

  // Trabalho
  "minimum-wage-raise": { unemployment: 0.3, inflation: 0.5, crime: -1, health: 1, groupSizePerSemester: [{ groupId: "poor", delta: -0.1 }] },
  "shorter-workweek": { gdp: -0.3, unemployment: -0.5, health: 1 },
  "job-stability": { gdp: -0.4, unemployment: -0.4, inflation: 0.3 },
  "state-single-union": { gdp: -0.3, pressFreedom: -3, corruption: 3, revolutionRisk: -2 },
  outsourcing: { gdp: 0.3, unemployment: -0.3, health: -1 },
  "labor-reform": { gdp: 0.4, unemployment: -0.8 },
  "end-payroll-taxes": { gdp: 0.5, unemployment: -0.8, debtPerSemester: 0.8 },
  "strike-ban": { gdp: 0.3, pressFreedom: -4, revolutionaryGrowth: 0.1 },

  // Saúde
  "public-network-expansion": { health: 5, debtPerSemester: 0.6 },
  "free-medicines": { health: 4, debtPerSemester: 0.5 },
  "fully-state-health": { gdp: -0.2, health: 3, corruption: 2, debtPerSemester: 0.6 },
  "private-partnerships": { gdp: 0.1, health: 2, corruption: 1, debtPerSemester: -0.3 },
  "health-vouchers": { health: 1, corruption: 1, debtPerSemester: -0.3 },
  "end-public-health": {
    gdp: 0.2, health: -9, debtPerSemester: -1.2, revolutionaryGrowth: 0.1,
    groupSizePerSemester: [{ groupId: "poor", delta: 0.1 }],
  },

  // Educação
  "school-meals-grants": { crime: -1, health: 1, education: 3, debtPerSemester: 0.4, groupSizePerSemester: [{ groupId: "poor", delta: -0.1 }] },
  "free-university": { education: 4, debtPerSemester: 0.6 },
  "mandatory-full-time-school": { crime: -2, education: 4, debtPerSemester: 0.5 },
  "single-state-school": { education: 1, pressFreedom: -4, corruption: 1, debtPerSemester: 0.3 },
  "civic-military-schools": { crime: -1, education: 1, debtPerSemester: 0.1, military: 5 },
  "single-national-curriculum": { education: -1, pressFreedom: -1, supportAnchor: 1 },
  "state-indoctrination": { education: -3, pressFreedom: -5, supportAnchor: 2, revolutionRisk: -2, revolutionaryGrowth: -0.1 },
  "party-youth": { education: -2, pressFreedom: -3, supportAnchor: 2, revolutionRisk: -3, military: -5, revolutionaryGrowth: -0.2 },

  // Costumes
  "same-sex-marriage": {},
  "legal-abortion": { health: 2 },
  "cannabis-legalization": { crime: -2, corruption: -1, debtPerSemester: -0.3 },
  "all-drugs-legalization": { crime: -3, health: -4, corruption: -2, debtPerSemester: -0.2 },
  "casino-ban": { crime: -1, corruption: -1, debtPerSemester: 0.2 },
  "abortion-ban": { health: -3 },
  "official-religion": { crime: -1, pressFreedom: -2, supportAnchor: 1, groupSizePerSemester: [{ groupId: "religious", delta: 0.2, cap: 50 }] },
  "religious-law": {
    crime: -3, education: -3, pressFreedom: -6, supportAnchor: 2, revolutionRisk: -2, revolutionaryGrowth: 0.1,
    groupSizePerSemester: [{ groupId: "religious", delta: 0.3, cap: 50 }],
  },
  "state-lottery": { debtPerSemester: -0.3 },
  "online-betting": { health: -1, corruption: 1, debtPerSemester: -0.4 },
  "casinos-allowed": { gdp: 0.3, crime: 1, corruption: 3, debtPerSemester: -0.4 },

  // Meio ambiente
  "emission-targets": { gdp: -0.1, health: 1, pollution: -4 },
  "reserve-protection": { gdp: -0.1, pollution: -4 },
  "end-fossil-fuels": { gdp: -0.8, unemployment: 0.8, inflation: 1.0, pollution: -10, debtPerSemester: 0.3 },
  "mandatory-degrowth": { gdp: -2.0, unemployment: 2.0, health: 2, pollution: -12, revolutionaryGrowth: 0.1 },
  "easier-environmental-licenses": { gdp: 0.3, pollution: 4, corruption: 1 },
  "mining-in-reserves": { gdp: 0.5, pollution: 7, corruption: 2, debtPerSemester: -0.2 },
  "end-environmental-laws": { gdp: 0.6, health: -3, pollution: 10, corruption: 2 },

  // Imigração
  "easier-visas": { gdp: 0.2 },
  "immigrant-amnesty": { gdp: 0.2, corruption: -1, debtPerSemester: 0.2, groupSizePerSemester: [{ groupId: "immigrants", delta: 0.1, cap: 15 }] },
  "open-borders": { gdp: 0.5, unemployment: 0.6, health: -1, debtPerSemester: 0.3, groupSizePerSemester: [{ groupId: "immigrants", delta: 0.3, cap: 15 }] },
  "immigration-quotas": { gdp: -0.1 },
  "border-wall": { crime: -1, corruption: 1, debtPerSemester: 0.1, debtOnce: 3 },
  "mass-deportation": {
    gdp: -0.6, inflation: 0.6, pressFreedom: -3, corruption: 1, debtOnce: 1.5, revolutionaryGrowth: 0.1,
    groupSizeOnce: [{ groupId: "immigrants", multiplier: 0.5 }],
  },

  // Imprensa e liberdades
  "media-regulation": { pressFreedom: -5, media: -10 },
  "strong-state-media": { pressFreedom: -4, debtPerSemester: 0.3, media: 10, supportAnchor: 1 },
  censorship: { pressFreedom: -15, corruption: 3, supportAnchor: 1, revolutionaryGrowth: 0.1 },
  "state-information-monopoly": { pressFreedom: -20, corruption: 3, supportAnchor: 2, revolutionaryGrowth: 0.1 },
  "public-cameras": { crime: -2, pressFreedom: -1, debtPerSemester: 0.1 },
  "internet-monitoring": { crime: -1, pressFreedom: -4, revolutionRisk: -2 },
  "mass-surveillance": { crime: -2, pressFreedom: -7, revolutionRisk: -3, revolutionaryGrowth: -0.3 },
  "thought-police": { education: -1, pressFreedom: -10, revolutionRisk: -5, military: -5, revolutionaryGrowth: -1.0 },

  // Poder e regime
  "state-of-emergency": { pressFreedom: -3, military: 10, coupRisk: -1 },
  "rule-by-decree": { corruption: 2, media: -10 },
  "judiciary-control": { gdp: -0.2, pressFreedom: -3, corruption: 5, media: -10 },
  "congress-dissolution": { pressFreedom: -4, corruption: 3, military: 5, coupRisk: 2, revolutionaryGrowth: 0.1 },
  "election-postponement": { gdp: -0.2, pressFreedom: -3, coupRisk: 1, revolutionaryGrowth: 0.2 },
  "end-of-elections": { gdp: -0.3, pressFreedom: -5, corruption: 4, coupRisk: 3, supportAnchor: 2, revolutionaryGrowth: 0.2 },
  "lifetime-title": { corruption: 2, revolutionaryGrowth: 0.1 },
  "new-constitution": { pressFreedom: -2, coupRisk: -2, revolutionRisk: -2 },
  coronation: { corruption: 2, debtOnce: 1.5, military: -10, coupRisk: 2, supportAnchor: 2 },
  succession: { corruption: 1, coupRisk: -4, revolutionRisk: -3, supportAnchor: 1 },
  "government-propaganda": { pressFreedom: -2, debtPerSemester: 0.2, media: 5, supportAnchor: 2 },
  "leader-holiday": { gdp: -0.1, supportAnchor: 2 },
  "mandatory-portraits": { pressFreedom: -2, debtPerSemester: 0.2, supportAnchor: 2 },
  "history-rewrite": { education: -3, pressFreedom: -5, supportAnchor: 3, revolutionRisk: -2 },
};

/**
 * Efeito por alíquota de imposto (game-design §1.4), absoluto e relativo a 30% = zero.
 * `taxRate` ausente da tabela = sem efeito (30%, estado inicial).
 */
export const taxRateEffects: Record<(typeof TAX_RATES)[number], NodeEffect> = {
  0: { gdp: 1.0, unemployment: -0.6, health: -5, education: -5, crime: 3, debtPerSemester: 2.6 },
  10: { gdp: 0.7, unemployment: -0.4, health: -3, education: -3, crime: 2, debtPerSemester: 1.8 },
  20: { gdp: 0.35, unemployment: -0.2, health: -1.5, education: -1.5, crime: 1, debtPerSemester: 0.9 },
  30: {},
  40: { gdp: -0.3, unemployment: 0.2, health: 1.5, education: 1.5, debtPerSemester: -0.8 },
  50: { gdp: -0.7, unemployment: 0.5, health: 3, education: 3, crime: -1, corruption: 1, debtPerSemester: -1.5 },
  60: { gdp: -1.2, unemployment: 0.9, health: 4, education: 4, crime: -1, corruption: 2, debtPerSemester: -2.0 },
  70: { gdp: -1.8, unemployment: 1.4, health: 5, education: 5, crime: -1, corruption: 3, debtPerSemester: -2.3 },
};
