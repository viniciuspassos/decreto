/**
 * Campos e árvores de políticas (S1 do roteiro) e etapas de regime (S4).
 * Só ids: nomes visíveis vivem nas chaves de i18n do frontend (`field.*`, `tree.*`, `node.*`).
 */

export type FieldId =
  | "security"
  | "economy"
  | "labor"
  | "health"
  | "education"
  | "customs"
  | "environment"
  | "immigration"
  | "press"
  | "power";

export interface PolicyTree {
  id: string;
  field: FieldId;
  /** Do moderado (índice 0 = profundidade 1) ao radical. */
  nodes: string[];
  /** Árvore oposta no mesmo campo: uma ativa bloqueia a outra (S1, 16.1). */
  opposite?: string;
  /** Política de intensidade (ex.: impostos) em vez de liga/desliga. */
  intensity?: boolean;
}

export const policyTrees: PolicyTree[] = [
  { id: "disarmament", field: "security", opposite: "civil-arms", nodes: ["mandatory-registration", "carry-restriction", "gun-buyback", "total-gun-ban"] },
  { id: "civil-arms", field: "security", opposite: "disarmament", nodes: ["easier-registration", "citizen-carry", "free-carry", "legal-militias"] },
  { id: "hard-line", field: "security", nodes: ["harsher-sentences", "military-on-streets", "life-sentence", "death-penalty"] },
  { id: "secret-police", field: "security", nodes: ["secret-police", "opposition-surveillance", "arrest-opponents", "torture", "opponent-assassination"] },
  { id: "statization", field: "economy", opposite: "free-market", nodes: ["strategic-state-company", "price-controls", "sector-nationalization", "end-private-property"] },
  { id: "free-market", field: "economy", opposite: "statization", nodes: ["privatizations", "deregulation", "end-minimum-wage", "minimal-state"] },
  { id: "taxes", field: "economy", intensity: true, nodes: ["taxes-20", "taxes-30", "taxes-40", "taxes-50", "taxes-60", "taxes-70"] },
  { id: "labor-rights", field: "labor", opposite: "flexibilization", nodes: ["minimum-wage-raise", "shorter-workweek", "job-stability", "state-single-union"] },
  { id: "flexibilization", field: "labor", opposite: "labor-rights", nodes: ["outsourcing", "labor-reform", "end-payroll-taxes", "strike-ban"] },
  { id: "public-health", field: "health", opposite: "private-health", nodes: ["public-network-expansion", "free-medicines", "fully-state-health"] },
  { id: "private-health", field: "health", opposite: "public-health", nodes: ["private-partnerships", "health-vouchers", "end-public-health"] },
  { id: "public-education", field: "education", nodes: ["school-meals-grants", "free-university", "mandatory-full-time-school", "single-state-school"] },
  { id: "ideological-education", field: "education", nodes: ["civic-military-schools", "single-national-curriculum", "state-indoctrination", "party-youth"] },
  { id: "individual-liberties", field: "customs", opposite: "conservatism", nodes: ["same-sex-marriage", "legal-abortion", "cannabis-legalization", "all-drugs-legalization"] },
  { id: "conservatism", field: "customs", opposite: "individual-liberties", nodes: ["casino-ban", "abortion-ban", "official-religion", "religious-law"] },
  { id: "gambling", field: "customs", nodes: ["state-lottery", "online-betting", "casinos-allowed"] },
  { id: "environmentalism", field: "environment", opposite: "exploitation", nodes: ["emission-targets", "reserve-protection", "end-fossil-fuels", "mandatory-degrowth"] },
  { id: "exploitation", field: "environment", opposite: "environmentalism", nodes: ["easier-environmental-licenses", "mining-in-reserves", "end-environmental-laws"] },
  { id: "openness", field: "immigration", opposite: "closure", nodes: ["easier-visas", "immigrant-amnesty", "open-borders"] },
  { id: "closure", field: "immigration", opposite: "openness", nodes: ["immigration-quotas", "border-wall", "mass-deportation"] },
  { id: "media-control", field: "press", nodes: ["media-regulation", "strong-state-media", "censorship", "state-information-monopoly"] },
  { id: "surveillance", field: "press", nodes: ["public-cameras", "internet-monitoring", "mass-surveillance", "thought-police"] },
  { id: "authoritarianism", field: "power", nodes: ["state-of-emergency", "rule-by-decree", "judiciary-control", "congress-dissolution", "election-postponement", "end-of-elections"] },
  { id: "monarchy", field: "power", nodes: ["lifetime-title", "new-constitution", "coronation", "succession"] },
  { id: "personality-cult", field: "power", nodes: ["government-propaganda", "leader-holiday", "mandatory-portraits", "history-rewrite"] },
];

/**
 * Precedente histórico revelado quando o nó é ativado (ids de `historical-figures.ts`).
 * Mapeamento ilustrativo, conforme o design de UI.
 */
export const nodeFigures: Record<string, string> = {
  "easier-registration": "jair-bolsonaro",
  "military-on-streets": "costa-e-silva",
  "opposition-surveillance": "erich-honecker",
  "arrest-opponents": "emilio-garrastazu-medici",
  "torture": "augusto-pinochet",
  "strategic-state-company": "getulio-vargas",
  "sector-nationalization": "hugo-chavez",
  "end-private-property": "mao-tse-tung",
  "privatizations": "fernando-henrique-cardoso",
  "minimal-state": "margaret-thatcher",
  "minimum-wage-raise": "getulio-vargas",
  "public-network-expansion": "clement-attlee",
  "school-meals-grants": "luiz-inacio-lula-da-silva",
  "same-sex-marriage": "barack-obama",
  "official-religion": "khomeini",
  "emission-targets": "jacinda-ardern",
  "immigrant-amnesty": "angela-merkel",
  "border-wall": "viktor-orban",
  "internet-monitoring": "xi-jinping",
  "censorship": "recep-tayyip-erdogan",
  "government-propaganda": "juan-domingo-peron",
  "history-rewrite": "stalin",
  "state-of-emergency": "indira-gandhi",
  "coronation": "napoleao",
};
