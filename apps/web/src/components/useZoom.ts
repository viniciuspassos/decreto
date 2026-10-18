import { useRef, useState, type PointerEvent, type WheelEvent } from "react";

/** Lado do quadrado do mapa radial, em unidades SVG. */
export const MAP_SIZE = 1400;
export const MIN_SCALE = 0.6;
export const MAX_SCALE = 4;
/** Abaixo desta escala, as ações se agrupam por campo. */
export const CLUSTER_BELOW = 1;
const STEP = 1.4;

export interface View {
  scale: number;
  x: number;
  y: number;
}

export const INITIAL_VIEW: View = { scale: 1, x: MAP_SIZE / 2, y: MAP_SIZE / 2 };

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

export function viewBox(v: View): string {
  const w = MAP_SIZE / v.scale;
  return `${v.x - w / 2} ${v.y - w / 2} ${w} ${w}`;
}

export const zoomBy = (v: View, factor: number): View => ({ ...v, scale: clampScale(v.scale * factor) });

/** Move o centro da vista por um deslocamento em pixels de tela. */
export function panBy(v: View, dx: number, dy: number, screenSize: number): View {
  const unitsPerPx = MAP_SIZE / v.scale / (screenSize || 1);
  return { ...v, x: v.x - dx * unitsPerPx, y: v.y - dy * unitsPerPx };
}

export function useZoom() {
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    const { x, y } = drag.current;
    drag.current = { x: e.clientX, y: e.clientY };
    setView((v) => panBy(v, e.clientX - x, e.clientY - y, size));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onWheel = (e: WheelEvent<SVGSVGElement>) => setView((v) => zoomBy(v, e.deltaY < 0 ? STEP : 1 / STEP));

  return {
    view,
    zoomIn: () => setView((v) => zoomBy(v, STEP)),
    zoomOut: () => setView((v) => zoomBy(v, 1 / STEP)),
    reset: () => setView(INITIAL_VIEW),
    focus: (x: number, y: number, scale: number) => setView({ x, y, scale: clampScale(scale) }),
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave: onPointerUp, onWheel },
  };
}
