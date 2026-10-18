/**
 * Posiciona rótulos do mapa radial sem sobreposição: nome acima do nó, figura abaixo.
 * Guloso por prioridade — um rótulo que colidiria com outro rótulo ou nó fica oculto
 * (aparece ao aproximar, já que a fonte encolhe em unidades SVG conforme o zoom).
 */

export interface LabelCandidate {
  id: string;
  x: number;
  y: number;
  name: string;
  figure?: string;
  /** Menor = mais importante. */
  priority: number;
}

export interface PlacedLabel {
  id: string;
  kind: "name" | "figure";
  text: string;
  x: number;
  y: number;
}

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const NODE_RADIUS = 10;
const GAP = 6;
/** Largura média de um caractere de Barlow em relação ao tamanho da fonte (folgada). */
const CHAR_WIDTH = 0.55;

const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

export function textBox(text: string, cx: number, cy: number, font: number): Box {
  const half = (text.length * font * CHAR_WIDTH) / 2;
  return { x1: cx - half, x2: cx + half, y1: cy - font / 2, y2: cy + font / 2 };
}

export interface Obstacle {
  x: number;
  y: number;
  r: number;
}

/** `obstacles`: círculos que nenhum rótulo pode cobrir (todos os nós, o centro). */
export function layoutLabels(candidates: LabelCandidate[], font: number, obstacles: Obstacle[]): PlacedLabel[] {
  const r = NODE_RADIUS;
  const taken: Box[] = obstacles.map((o) => ({ x1: o.x - o.r, x2: o.x + o.r, y1: o.y - o.r, y2: o.y + o.r }));
  const placed: PlacedLabel[] = [];
  const tryPlace = (label: PlacedLabel) => {
    const box = textBox(label.text, label.x, label.y, font);
    if (taken.some((b) => overlaps(b, box))) return;
    taken.push(box);
    placed.push(label);
  };
  const offset = r + GAP + font / 2;
  const byPriority = [...candidates].sort((a, b) => a.priority - b.priority);
  byPriority.forEach((c) => tryPlace({ id: c.id, kind: "name", text: c.name, x: c.x, y: c.y - offset }));
  byPriority.forEach((c) => c.figure && tryPlace({ id: c.id, kind: "figure", text: c.figure, x: c.x, y: c.y + offset }));
  return placed;
}
