/** Utopias (design S5): trees that must be complete and remain active for consecutive turns. */

export interface UtopiaTreeRequirement {
  treeId: string;
  /** Required depth when a tree does not need to be complete (e.g. Surveillance through node 2). */
  upTo?: number;
}

export interface Utopia {
  id: string;
  trees: UtopiaTreeRequirement[];
}

export const UTOPIA_TURNS_REQUIRED = 4;

export const utopias: Utopia[] = [
  { id: "1984", trees: [{ treeId: "surveillance" }, { treeId: "media-control" }, { treeId: "secret-police" }, { treeId: "personality-cult" }, { treeId: "authoritarianism" }] },
  { id: "socialist", trees: [{ treeId: "statization" }, { treeId: "labor-rights" }, { treeId: "public-health" }, { treeId: "public-education" }] },
  { id: "anarcho-capitalist", trees: [{ treeId: "free-market" }, { treeId: "flexibilization" }, { treeId: "private-health" }] },
  { id: "theocracy", trees: [{ treeId: "conservatism" }, { treeId: "ideological-education" }, { treeId: "authoritarianism" }] },
  { id: "technocracy", trees: [{ treeId: "environmentalism" }, { treeId: "public-education" }, { treeId: "surveillance", upTo: 2 }] },
];
