import type { EndGameResult } from "@decreto/shared-types";
import type { SemesterContent } from "./content.js";
import type { EndReason } from "./endConditions.js";
import { activeCount } from "./trees.js";
import type { EngineState } from "./types.js";

const TOP = 5;
/** With no node tied to a historical precedent, the government "did nothing" notable. */
const FALLBACK_FIGURE = "nelson-mandela";

/** S7: historical figures ranked by the share of active nodes that refer to them. */
export function rankFigures(state: EngineState, content: SemesterContent): EndGameResult["ranking"] {
  const counts = new Map<string, number>();
  state.activeNodes.forEach((n) => {
    const figureId = content.nodeFigures[n];
    if (figureId) counts.set(figureId, (counts.get(figureId) ?? 0) + 1);
  });
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [{ figureId: FALLBACK_FIGURE, similarity: 100 }];
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP)
    .map(([figureId, n]) => ({ figureId, similarity: Math.round((100 * n) / total) }));
}

export function endGameResult(state: EngineState, reason: EndReason, content: SemesterContent): EndGameResult {
  const topTrees = content.policyTrees
    .map((t) => ({ id: t.id, n: activeCount(state, t.id, content) }))
    .filter((t) => t.n > 0).sort((a, b) => b.n - a.n).slice(0, TOP).map((t) => t.id);
  return { outcome: reason === "twentyYears" ? "victory" : "defeat", reason, ranking: rankFigures(state, content), topTrees };
}
