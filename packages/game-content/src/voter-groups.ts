/** Grupos de eleitores (S2 do roteiro). `likes`/`dislikes` são ids de árvores de `policy-trees.ts`. */

export interface VoterGroup {
  id: string;
  likes: string[];
  dislikes: string[];
  /** Surge durante o jogo (revolucionários, rebeldes) em vez de existir desde a posse. */
  emergent?: boolean;
}

export const voterGroups: VoterGroup[] = [
  { id: "religious", likes: ["conservatism"], dislikes: ["individual-liberties", "gambling"] },
  { id: "progressives", likes: ["individual-liberties", "environmentalism"], dislikes: ["media-control", "conservatism"] },
  { id: "business", likes: ["free-market", "flexibilization"], dislikes: ["statization", "taxes"] },
  { id: "workers", likes: ["labor-rights", "public-health"], dislikes: ["flexibilization"] },
  { id: "poor", likes: ["public-health", "public-education"], dislikes: ["taxes"] },
  { id: "middle-class", likes: ["hard-line"], dislikes: ["taxes"] },
  { id: "rich", likes: ["free-market"], dislikes: ["statization", "taxes"] },
  { id: "environmentalists", likes: ["environmentalism"], dislikes: ["exploitation"] },
  { id: "agribusiness", likes: ["exploitation", "civil-arms"], dislikes: ["environmentalism"] },
  { id: "security-forces", likes: ["hard-line", "secret-police"], dislikes: [] },
  { id: "youth", likes: ["public-education", "individual-liberties"], dislikes: ["media-control"] },
  { id: "retirees", likes: ["public-health"], dislikes: ["flexibilization"] },
  { id: "nationalists", likes: ["closure", "personality-cult"], dislikes: ["openness"] },
  { id: "immigrants", likes: ["openness"], dislikes: ["closure"] },
  { id: "gun-owners", likes: ["civil-arms"], dislikes: ["disarmament"] },
  { id: "revolutionaries", likes: [], dislikes: [], emergent: true },
  { id: "rebels", likes: [], dislikes: [], emergent: true },
];
