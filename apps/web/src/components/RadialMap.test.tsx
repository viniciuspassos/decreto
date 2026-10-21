import { fireEvent, render, screen } from "@testing-library/react";
import "../i18n/index.js";
import { loadSave } from "../api/mockApi.js";
import { RadialMap, TREE_ANGLES, fieldAngle, labelCandidates } from "./RadialMap.js";
import { INITIAL_VIEW, MAX_SCALE, MIN_SCALE, panBy, viewBox, zoomBy } from "./useZoom.js";

const renderMap = () => {
  render(<RadialMap game={loadSave()} selected={null} onSelect={() => undefined} />);
  return screen.getByRole("img");
};

describe("useZoom (helpers)", () => {
  it("initial viewBox covers the entire map and shrinks when zooming in", () => {
    expect(viewBox(INITIAL_VIEW)).toBe("0 0 1400 1400");
    expect(viewBox(zoomBy(INITIAL_VIEW, 2))).toBe("350 350 700 700");
  });

  it("zoom respects the limits", () => {
    expect(zoomBy(INITIAL_VIEW, 100).scale).toBe(MAX_SCALE);
    expect(zoomBy(INITIAL_VIEW, 0.01).scale).toBe(MIN_SCALE);
  });

  it("dragging moves the center in proportion to the screen size", () => {
    expect(panBy(INITIAL_VIEW, 70, 0, 1400).x).toBe(630);
    expect(panBy(INITIAL_VIEW, 0, 1, 0).y).toBe(-700);
  });
});

// jsdom does not implement PointerEvent; without this, clientX is undefined in handlers.
beforeAll(() => {
  if (!("PointerEvent" in window)) Object.assign(window, { PointerEvent: MouseEvent });
});

describe("RadialMap", () => {
  it("separates fields with angular spacing between them", () => {
    expect(new Set(TREE_ANGLES).size).toBe(TREE_ANGLES.length);
    expect(fieldAngle("security")).toBeLessThan(fieldAngle("economy"));
  });

  it("zooms in, zooms out, and recenters with the buttons and wheel", () => {
    const svg = renderMap();
    fireEvent.click(screen.getByLabelText("Aproximar"));
    expect(svg.getAttribute("viewBox")).not.toBe("0 0 1400 1400");
    fireEvent.click(screen.getByLabelText("Recentralizar"));
    expect(svg.getAttribute("viewBox")).toBe("0 0 1400 1400");
    fireEvent.wheel(svg, { deltaY: -100 });
    fireEvent.wheel(svg, { deltaY: -100 });
    fireEvent.wheel(svg, { deltaY: 100 });
    const width = Number(svg.getAttribute("viewBox")?.split(" ")[2]);
    expect(width).toBeCloseTo(1000);
  });

  it("zooming out groups actions by field, and clicking a group zooms in on it", () => {
    const svg = renderMap();
    fireEvent.click(screen.getByLabelText("Afastar"));
    expect(screen.queryByText("Prender opositores 48")).toBeNull();
    expect(screen.getByText("2 ativas · 4 disponíveis")).toBeTruthy();
    fireEvent.click(screen.getByText("Segurança"));
    expect(screen.queryByText("2 ativas · 4 disponíveis")).toBeNull();
    expect(screen.getAllByText("Prender opositores")[0]?.tagName).toBe("title");
    expect(svg.getAttribute("viewBox")).not.toBe("0 0 1400 1400");
  });

  it("drags to pan", () => {
    const svg = renderMap();
    fireEvent.pointerMove(svg, { clientX: 50, clientY: 0 });
    expect(svg.getAttribute("viewBox")).toBe("0 0 1400 1400");
    fireEvent.pointerDown(svg, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(svg, { clientX: 1, clientY: 0 });
    fireEvent.pointerUp(svg);
    expect(svg.getAttribute("viewBox")).toBe("-1400 0 1400 1400");
  });

  it("zooming in reveals more labels, with the name above and the figure below, and clicking a label selects it", () => {
    const selected: string[] = [];
    render(<RadialMap game={loadSave()} selected="torture" onSelect={(id) => selected.push(id)} />);
    const count = () => document.querySelectorAll("text.label").length;
    const before = count();
    fireEvent.click(screen.getByLabelText("Aproximar"));
    fireEvent.click(screen.getByLabelText("Aproximar"));
    fireEvent.click(screen.getByLabelText("Aproximar"));
    expect(count()).toBeGreaterThan(before);
    expect(screen.getByText("≈ Honecker")).toBeTruthy();
    const label = screen.getAllByText("Tortura").find((el) => el.tagName === "text");
    if (!label) throw new Error("Selected label was not positioned");
    fireEvent.click(label);
    expect(selected).toEqual(["torture"]);
  });
});

describe("labelCandidates", () => {
  it("ignores blocked items except the selected one, which has the highest priority", () => {
    const nodes = [
      { nodeId: "torture", status: "blocked" as const, x: 0, y: 0 },
      { nodeId: "censorship", status: "blocked" as const, x: 0, y: 0 },
      { nodeId: "opposition-surveillance", status: "active" as const, x: 0, y: 0 },
    ];
    const result = labelCandidates(nodes, "torture", (n) => n.nodeId);
    expect(result.map((c) => [c.id, c.priority])).toEqual([["torture", 0], ["opposition-surveillance", 3]]);
    expect(result[1]?.figure).toBe("≈ Honecker");
  });
});
