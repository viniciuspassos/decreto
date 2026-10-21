import { useTranslation } from "react-i18next";
import { historicalFigures, nodeFigures, policyTrees, type FieldId } from "@decreto/game-content";
import type { GameState, NodeStatus } from "@decreto/shared-types";
import { nodeCost, nodeStatus } from "../api/mockApi.js";
import { NODE_RADIUS, layoutLabels, type LabelCandidate } from "./labelLayout.js";
import { CLUSTER_BELOW, MAP_SIZE, useZoom, viewBox } from "./useZoom.js";

const C = MAP_SIZE / 2;
const R0 = 120;
const STEP = 80;
const RINGS = 6;
const CLUSTER_ZOOM = 1.8;
/** Label size in SVG units at scale 1; divided by the scale to remain constant on screen. */
const LABEL_FONT = 24;
const BLOCKED_RADIUS = 4;
const PRIORITY: Record<NodeStatus, number> = { queued: 1, available: 2, active: 3, blocked: 9 };

export const ringRadius = (depth: number) => R0 + depth * STEP;
export const polar = (angle: number, r: number) => ({ x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) });

const FIELDS = [...new Set(policyTrees.map((tr) => tr.field))];
/** One radius per tree, with an empty position between fields to separate groups. */
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
            <Network game={game} selected={selected} onSelect={onSelect} scale={zoom.view.scale} />
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

interface MapNode {
  nodeId: string;
  status: NodeStatus;
  x: number;
  y: number;
}

const mapNodes = (game: GameState): MapNode[] =>
  policyTrees.flatMap((tree, i) =>
    tree.nodes.map((nodeId, d) => ({ nodeId, status: nodeStatus(game, nodeId), ...polar(TREE_ANGLES[i] ?? 0, ringRadius(d + 1)) })),
  );

/** Candidate labels: everything that is not blocked, plus the selected policy (highest priority). */
export function labelCandidates(nodes: MapNode[], selected: string | null, nameOf: (n: MapNode) => string): LabelCandidate[] {
  return nodes
    .filter((n) => n.status !== "blocked" || n.nodeId === selected)
    .map((n) => {
      const figure = n.status === "active" ? nodeFigures[n.nodeId] : undefined;
      return {
        id: n.nodeId, x: n.x, y: n.y, name: nameOf(n),
        figure: figure && `≈ ${figureShortName(figure)}`,
        priority: n.nodeId === selected ? 0 : PRIORITY[n.status],
      };
    });
}

function Network({ game, selected, onSelect, scale }: Props & { scale: number }) {
  const { t } = useTranslation();
  const nodes = mapNodes(game);
  const nameOf = (n: MapNode) =>
    t(`node.${n.nodeId}`) + { available: ` ${nodeCost(n.nodeId)}`, queued: ` · ${t("main.queued")}`, active: "", blocked: "" }[n.status];
  const font = LABEL_FONT / scale;
  const obstacles = [{ x: C, y: C, r: R0 - 20 }, ...nodes.map((n) => ({ x: n.x, y: n.y, r: n.status === "blocked" ? BLOCKED_RADIUS : NODE_RADIUS }))];
  const labels = layoutLabels(labelCandidates(nodes, selected, nameOf), font, obstacles);
  return (
    <>
      {policyTrees.map((tree, i) => {
        const start = polar(TREE_ANGLES[i] ?? 0, R0 - 20);
        const end = polar(TREE_ANGLES[i] ?? 0, ringRadius(tree.nodes.length));
        return <line key={tree.id} className="spoke" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
      })}
      {nodes.map((n) => (
        <g key={n.nodeId} className={`node ${n.status}${selected === n.nodeId ? " selected" : ""}`} onClick={() => onSelect(n.nodeId)}>
          <title>{t(`node.${n.nodeId}`)}</title>
          <circle cx={n.x} cy={n.y} r={n.status === "blocked" ? BLOCKED_RADIUS : NODE_RADIUS} />
        </g>
      ))}
      {labels.map((l) => (
        <text key={`${l.kind}-${l.id}`} className={l.kind === "figure" ? "label figure" : "label"} x={l.x} y={l.y} textAnchor="middle" style={{ fontSize: font }} onClick={() => onSelect(l.id)}>
          {l.text}
        </text>
      ))}
    </>
  );
}
