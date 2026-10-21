import { layoutLabels, textBox, type LabelCandidate } from "./labelLayout.js";

const FONT = 10;
const cand = (id: string, [x, y]: [number, number], priority: number, figure?: string): LabelCandidate =>
  ({ id, x, y, name: id, priority, figure });

describe("layoutLabels", () => {
  it("places the name above the node and the figure below", () => {
    const [name, figure] = layoutLabels([cand("a", [100, 100], 1, "≈ X")], FONT, []);
    expect(name).toMatchObject({ kind: "name", x: 100 });
    expect(name?.y).toBeLessThan(100);
    expect(figure).toMatchObject({ kind: "figure", x: 100 });
    expect(figure?.y).toBeGreaterThan(100);
  });

  it("never lets labels overlap: the lower-priority label is hidden", () => {
    const placed = layoutLabels([cand("baixa", [105, 100], 3), cand("alta", [100, 100], 0)], FONT, []);
    expect(placed.map((p) => p.id)).toEqual(["alta"]);
  });

  it("does not cover obstacles and shows both when there is room", () => {
    expect(layoutLabels([cand("a", [100, 100], 1)], FONT, [{ x: 100, y: 80, r: 5 }])).toEqual([]);
    expect(layoutLabels([cand("a", [0, 0], 1), cand("b", [500, 0], 1)], FONT, [])).toHaveLength(2);
  });

  it("placed label boxes do not intersect (dense network)", () => {
    const grid = Array.from({ length: 60 }, (_, i) => cand(`n${i}`, [(i % 10) * 25, Math.floor(i / 10) * 18], i % 4, "≈ Fig"));
    const boxes = layoutLabels(grid, FONT, []).map((p) => textBox(p.text, p.x, p.y, FONT));
    boxes.forEach((a, i) =>
      boxes.slice(i + 1).forEach((b) => {
        expect(a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2).toBe(false);
      }),
    );
  });
});
