import { useTranslation } from "react-i18next";
import { historicalFigures, nodeFigures, policyTrees, type FieldId } from "@decreto/game-content";
import type { GameState } from "@decreto/shared-types";
import { nodeCost, nodeStatus } from "../api/mockApi.js";

const C = 500;
const R0 = 70;
const STEP = 60;
const RINGS = 6;

export const ringRadius = (depth: number) => R0 + depth * STEP;
export const spokeAngle = (i: number, n: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
export const polar = (angle: number, r: number) => ({ x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) });

export const figureShortName = (figureId: string) =>
  historicalFigures.find((f) => f.id === figureId)?.figure.split(" ").at(-1) ?? "";

/** Texto ao longo do raio, sem ficar de cabeça para baixo no lado esquerdo. */
function radialText(angle: number, r: number) {
  const { x, y } = polar(angle, r);
  const left = Math.cos(angle) < 0;
  const deg = (angle * 180) / Math.PI + (left ? 180 : 0);
  return { x, y, transform: `rotate(${deg} ${x} ${y})`, textAnchor: left ? "end" : "start" } as const;
}

interface Props {
  game: GameState;
  selected: string | null;
  onSelect: (nodeId: string) => void;
}

export function RadialMap({ game, selected, onSelect }: Props) {
  const { t } = useTranslation();
  const n = policyTrees.length;
  const fields = [...new Set(policyTrees.map((tr) => tr.field))];

  return (
    <svg className="radial" viewBox="-40 -40 1080 1080" role="img" aria-label={t("main.mapLabel")}>
      {Array.from({ length: RINGS }, (_, i) => (
        <circle key={i} className="ring" cx={C} cy={C} r={ringRadius(i + 1)} />
      ))}
      {fields.map((field: FieldId) => {
        const idx = policyTrees.flatMap((tr, i) => (tr.field === field ? [i] : []));
        const angle = spokeAngle(idx.reduce((a, b) => a + b, 0) / idx.length, n);
        const { x, y } = polar(angle, ringRadius(RINGS) + 40);
        return (
          <text key={field} className="field-label" x={x} y={y} textAnchor="middle">
            {t(`field.${field}`)}
          </text>
        );
      })}
      {policyTrees.map((tree, i) => {
        const angle = spokeAngle(i, n);
        const start = polar(angle, R0 - 15);
        const end = polar(angle, ringRadius(tree.nodes.length));
        return (
          <g key={tree.id}>
            <line className="spoke" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            {tree.nodes.map((nodeId, d) => {
              const status = nodeStatus(game, nodeId);
              const { x, y } = polar(angle, ringRadius(d + 1));
              const figure = status === "active" ? nodeFigures[nodeId] : undefined;
              const suffix = status === "available" ? ` ${nodeCost(nodeId)}` : status === "queued" ? ` · ${t("main.queued")}` : "";
              return (
                <g key={nodeId} className={`node ${status}${selected === nodeId ? " selected" : ""}`} onClick={() => onSelect(nodeId)}>
                  <title>{t(`node.${nodeId}`)}</title>
                  <circle cx={x} cy={y} r={status === "blocked" ? 4 : 9} />
                  {(status === "available" || status === "queued" || selected === nodeId) && <text {...radialText(angle, ringRadius(d + 1) + 14)}>{t(`node.${nodeId}`) + suffix}</text>}
                  {figure && <text className="figure" {...radialText(angle + 0.06, ringRadius(d + 1) - 40)}>≈ {figureShortName(figure)}</text>}
                </g>
              );
            })}
          </g>
        );
      })}
      <circle className="center" cx={C} cy={C} r={R0 - 15} />
      <text className="center-label" x={C} y={C} textAnchor="middle">
        {game.president}
      </text>
    </svg>
  );
}
