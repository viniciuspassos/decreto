import { useTranslation } from "react-i18next";
import { historicalFigures, nodeFigures, policyTrees, type FieldId, type PolicyTree } from "@decreto/game-content";
import type { GameState, NodeStatus } from "@decreto/shared-types";
import { nodeCost, nodeStatus } from "../api/mockApi.js";
import { CLUSTER_BELOW, MAP_SIZE, useZoom, viewBox } from "./useZoom.js";

const C = MAP_SIZE / 2;
const R0 = 90;
const STEP = 80;
const RINGS = 6;
const CLUSTER_ZOOM = 1.8;
/** Escalas a partir das quais as disponíveis e, depois, as ativas ganham rótulo. */
const LABEL_AVAILABLE_FROM = 1.4;
const LABEL_ACTIVE_FROM = 2.4;

export const ringRadius = (depth: number) => R0 + depth * STEP;
export const polar = (angle: number, r: number) => ({ x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) });

const FIELDS = [...new Set(policyTrees.map((tr) => tr.field))];
/** Um raio por árvore, com uma posição vazia entre campos para separar os grupos. */
const SLOTS = policyTrees.length + FIELDS.length;
export const TREE_ANGLES = policyTrees.map(
  (tr, i) => ((i + FIELDS.indexOf(tr.field)) / SLOTS) * 2 * Math.PI - Math.PI / 2,
);

export function fieldAngle(field: FieldId): number {
  const angles = TREE_ANGLES.filter((_, i) => policyTrees[i]?.field === field);
  return angles.reduce((a, b) => a + b, 0) / angles.length;
}

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
  const zoom = useZoom();
  const clustered = zoom.view.scale < CLUSTER_BELOW;

  return (
    <div className="radial-wrap">
      <div className="zoom-controls">
        <button className="btn" aria-label={t("main.zoomIn")} onClick={zoom.zoomIn}>+</button>
        <button className="btn" aria-label={t("main.zoomOut")} onClick={zoom.zoomOut}>−</button>
        <button className="btn" aria-label={t("main.zoomReset")} onClick={zoom.reset}>⟲</button>
      </div>
      <small className="muted zoom-hint">{t("main.zoomHint")}</small>
      <svg className="radial" viewBox={viewBox(zoom.view)} role="img" aria-label={t("main.mapLabel")} {...zoom.handlers}>
        {Array.from({ length: RINGS }, (_, i) => (
          <circle key={i} className="ring" cx={C} cy={C} r={ringRadius(i + 1)} />
        ))}
        {clustered ? (
          <FieldClusters game={game} onFocus={(x, y) => zoom.focus(x, y, CLUSTER_ZOOM)} />
        ) : (
          <>
            {FIELDS.map((field) => {
              const { x, y } = polar(fieldAngle(field), ringRadius(RINGS) + 45);
              return <text key={field} className="field-label" x={x} y={y} textAnchor="middle">{t(`field.${field}`)}</text>;
            })}
            {policyTrees.map((tree, i) => (
              <TreeSpoke key={tree.id} game={game} tree={tree} angle={TREE_ANGLES[i] ?? 0} selected={selected} onSelect={onSelect} scale={zoom.view.scale} />
            ))}
          </>
        )}
        <circle className="center" cx={C} cy={C} r={R0 - 20} />
        <text className="center-label" x={C} y={C} textAnchor="middle">{game.president}</text>
      </svg>
    </div>
  );
}

function FieldClusters({ game, onFocus }: { game: GameState; onFocus: (x: number, y: number) => void }) {
  const { t } = useTranslation();
  return (
    <>
      {FIELDS.map((field) => {
        const nodes = policyTrees.filter((tr) => tr.field === field).flatMap((tr) => tr.nodes);
        const count = (s: string) => nodes.filter((n) => nodeStatus(game, n) === s).length;
        const { x, y } = polar(fieldAngle(field), ringRadius(4.5));
        const focus = polar(fieldAngle(field), ringRadius(3));
        return (
          <g key={field} className="cluster" onClick={() => onFocus(focus.x, focus.y)}>
            <circle cx={x} cy={y} r={90 + nodes.length * 2} />
            <text className="field-label" x={x} y={y - 12} textAnchor="middle">{t(`field.${field}`)}</text>
            <text className="counts" x={x} y={y + 24} textAnchor="middle">{t("main.clusterCounts", { active: count("active"), available: count("available") })}</text>
          </g>
        );
      })}
    </>
  );
}

interface SpokeProps extends Props {
  tree: PolicyTree;
  angle: number;
  scale: number;
}

function TreeSpoke({ game, tree, angle, selected, onSelect, scale }: SpokeProps) {
  const start = polar(angle, R0 - 20);
  const end = polar(angle, ringRadius(tree.nodes.length));
  return (
    <g>
      <line className="spoke" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
      {/* Do mais radical ao moderado, para o rótulo de cada nó ficar por cima dos pontos seguintes. */}
      {tree.nodes.map((nodeId, d) => (
        <SpokeNode key={nodeId} nodeId={nodeId} status={nodeStatus(game, nodeId)} angle={angle} r={ringRadius(d + 1)} isSelected={selected === nodeId} onSelect={onSelect} scale={scale} />
      )).reverse()}
    </g>
  );
}

interface NodeProps {
  nodeId: string;
  status: NodeStatus;
  angle: number;
  r: number;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  scale: number;
}

function SpokeNode({ nodeId, status, angle, r, isSelected, onSelect, scale }: NodeProps) {
  const { t } = useTranslation();
  const { x, y } = polar(angle, r);
  const figure = status === "active" ? nodeFigures[nodeId] : undefined;
  const labelled = isSelected || status === "queued" || scale >= { available: LABEL_AVAILABLE_FROM, active: LABEL_ACTIVE_FROM, queued: 0, blocked: Infinity }[status];
  const suffix = { available: ` ${nodeCost(nodeId)}`, queued: ` · ${t("main.queued")}`, active: "", blocked: "" }[status];
  return (
    <g className={`node ${status}${isSelected ? " selected" : ""}`} onClick={() => onSelect(nodeId)}>
      <title>{t(`node.${nodeId}`)}</title>
      <circle cx={x} cy={y} r={status === "blocked" ? 4 : 10} />
      {labelled && <text {...radialText(angle, r + 20)}>{t(`node.${nodeId}`) + suffix}</text>}
      {figure && <text className="figure" {...radialText(angle + 0.05, r - 50)}>≈ {figureShortName(figure)}</text>}
    </g>
  );
}
