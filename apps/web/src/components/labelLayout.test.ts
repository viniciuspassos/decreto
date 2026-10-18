import { layoutLabels, textBox, type LabelCandidate } from "./labelLayout.js";

const FONT = 10;
const cand = (id: string, [x, y]: [number, number], priority: number, figure?: string): LabelCandidate =>
  ({ id, x, y, name: id, priority, figure });

describe("layoutLabels", () => {
  it("põe o nome acima do nó e a figura abaixo", () => {
    const [name, figure] = layoutLabels([cand("a", [100, 100], 1, "≈ X")], FONT, []);
    expect(name).toMatchObject({ kind: "name", x: 100 });
    expect(name?.y).toBeLessThan(100);
    expect(figure).toMatchObject({ kind: "figure", x: 100 });
    expect(figure?.y).toBeGreaterThan(100);
  });

  it("nunca deixa um rótulo sobrepor outro: o de menor prioridade fica oculto", () => {
    const placed = layoutLabels([cand("baixa", [105, 100], 3), cand("alta", [100, 100], 0)], FONT, []);
    expect(placed.map((p) => p.id)).toEqual(["alta"]);
  });

  it("não cobre obstáculos e mostra os dois quando há espaço", () => {
    expect(layoutLabels([cand("a", [100, 100], 1)], FONT, [{ x: 100, y: 80, r: 5 }])).toEqual([]);
    expect(layoutLabels([cand("a", [0, 0], 1), cand("b", [500, 0], 1)], FONT, [])).toHaveLength(2);
  });

  it("caixas dos rótulos posicionados não se cruzam (rede densa)", () => {
    const grid = Array.from({ length: 60 }, (_, i) => cand(`n${i}`, [(i % 10) * 25, Math.floor(i / 10) * 18], i % 4, "≈ Fig"));
    const boxes = layoutLabels(grid, FONT, []).map((p) => textBox(p.text, p.x, p.y, FONT));
    boxes.forEach((a, i) =>
      boxes.slice(i + 1).forEach((b) => {
        expect(a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2).toBe(false);
      }),
    );
  });
});
