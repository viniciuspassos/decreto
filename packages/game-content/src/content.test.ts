import { historicalFigures } from "./historical-figures";
import { nodeFigures, policyTrees } from "./policy-trees";
import { utopias } from "./utopias";
import { voterGroups } from "./voter-groups";

const treeIds = new Set(policyTrees.map((t) => t.id));
const nodeIds = policyTrees.flatMap((t) => t.nodes);

describe("conteúdo de jogo", () => {
  it("tem as 25 árvores do S1 com ids de nó únicos", () => {
    expect(policyTrees).toHaveLength(25);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
  });

  it("árvores opostas apontam uma para a outra", () => {
    policyTrees.filter((t) => t.opposite).forEach((t) => {
      expect(policyTrees.find((o) => o.id === t.opposite)?.opposite).toBe(t.id);
    });
  });

  it("mapeia nós existentes para figuras históricas existentes", () => {
    const figures = new Set(historicalFigures.map((f) => f.id));
    Object.entries(nodeFigures).forEach(([node, figure]) => {
      expect(nodeIds).toContain(node);
      expect(figures.has(figure)).toBe(true);
    });
  });

  it("grupos (S2) e utopias (S5) só referenciam árvores existentes", () => {
    expect(voterGroups).toHaveLength(17);
    voterGroups.flatMap((g) => [...g.likes, ...g.dislikes]).forEach((id) => expect(treeIds.has(id)).toBe(true));
    utopias.flatMap((u) => u.trees).forEach((r) => expect(treeIds.has(r.treeId)).toBe(true));
  });
});
