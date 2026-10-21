/** Voter groups (design S2). `likes`/`dislikes` are tree IDs from `policy-trees.ts`. */

export interface VoterGroup {
  id: string;
  likes: string[];
  dislikes: string[];
  /** Population share upon taking office (groups overlap; 0 for emergent groups). */
  initialSize: number;
  /** Emerges during the game (revolutionaries, rebels) instead of existing from the start. */
  emergent?: boolean;
}

export const voterGroups: VoterGroup[] = [
  { id: "religious", likes: ["conservatism"], dislikes: ["individual-liberties", "gambling"], initialSize: 28 },
  { id: "progressives", likes: ["individual-liberties", "environmentalism"], dislikes: ["media-control", "conservatism"], initialSize: 22 },
  { id: "business", likes: ["free-market", "flexibilization"], dislikes: ["statization", "taxes"], initialSize: 6 },
  { id: "workers", likes: ["labor-rights", "public-health"], dislikes: ["flexibilization"], initialSize: 41 },
  { id: "poor", likes: ["public-health", "public-education"], dislikes: ["taxes"], initialSize: 33 },
  { id: "middle-class", likes: ["hard-line"], dislikes: ["taxes"], initialSize: 30 },
  { id: "rich", likes: ["free-market"], dislikes: ["statization", "taxes"], initialSize: 3 },
  { id: "environmentalists", likes: ["environmentalism"], dislikes: ["exploitation"], initialSize: 7 },
  { id: "agribusiness", likes: ["exploitation", "civil-arms"], dislikes: ["environmentalism"], initialSize: 5 },
  { id: "security-forces", likes: ["hard-line", "secret-police"], dislikes: [], initialSize: 2 },
  { id: "youth", likes: ["public-education", "individual-liberties"], dislikes: ["media-control"], initialSize: 24 },
  { id: "retirees", likes: ["public-health"], dislikes: ["flexibilization"], initialSize: 15 },
  { id: "nationalists", likes: ["closure", "personality-cult"], dislikes: ["openness"], initialSize: 12 },
  { id: "immigrants", likes: ["openness"], dislikes: ["closure"], initialSize: 4 },
  { id: "gun-owners", likes: ["civil-arms"], dislikes: ["disarmament"], initialSize: 6 },
  { id: "revolutionaries", likes: [], dislikes: [], initialSize: 0, emergent: true },
  { id: "rebels", likes: [], dislikes: [], initialSize: 0, emergent: true },
];
