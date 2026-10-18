/** Utopias (S5 do roteiro): árvores que precisam estar completas e turnos seguidos exigidos. */

export interface UtopiaTreeRequirement {
  treeId: string;
  /** Profundidade exigida quando a árvore não precisa estar completa (ex.: Vigilância até o nó 2). */
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
