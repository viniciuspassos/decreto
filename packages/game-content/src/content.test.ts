import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { events, systemEvents } from "./events";
import { historicalFigures } from "./historical-figures";
import { nodeEffects, taxRateEffects } from "./node-effects";
import { EXCLUSIVE_NODE_PAIRS, EXTRA_PREREQS, nodeFigures, policyTrees } from "./policy-trees";
import { TAX_RATES } from "./rules";
import { utopias } from "./utopias";
import { voterGroups } from "./voter-groups";

const treeIds = new Set(policyTrees.map((t) => t.id));
const nodeIds = policyTrees.flatMap((t) => t.nodes);
const nodeIdSet = new Set(nodeIds);
const groupIds = new Set(voterGroups.map((g) => g.id));
const taxNodeIds = new Set(policyTrees.find((t) => t.id === "taxes")?.nodes);
const localesDir = join(dirname(fileURLToPath(import.meta.url)), "../../../apps/web/src/i18n/locales");
const locales = { "pt-BR": JSON.parse(readFileSync(join(localesDir, "pt-BR.json"), "utf-8")), en: JSON.parse(readFileSync(join(localesDir, "en.json"), "utf-8")) };

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

  it("tamanhos iniciais cobrem todos os grupos", () => {
    voterGroups.forEach((g) => expect(typeof g.initialSize).toBe("number"));
  });

  it("extraPrereqs e pares exclusivos só referenciam nós existentes", () => {
    Object.entries(EXTRA_PREREQS).forEach(([nodeId, prereqs]) => {
      expect(nodeIdSet.has(nodeId)).toBe(true);
      prereqs.forEach((id) => expect(nodeIdSet.has(id)).toBe(true));
    });
    EXCLUSIVE_NODE_PAIRS.forEach(([a, b]) => {
      expect(nodeIdSet.has(a)).toBe(true);
      expect(nodeIdSet.has(b)).toBe(true);
    });
  });

  it("todo nó (exceto a árvore de impostos) tem efeito definido; alíquotas de imposto cobrem TAX_RATES", () => {
    nodeIds.filter((id) => !taxNodeIds.has(id)).forEach((id) => expect(nodeEffects[id]).toBeDefined());
    TAX_RATES.forEach((rate) => expect(taxRateEffects[rate]).toBeDefined());
  });

  it("efeitos de nó só referenciam grupos existentes", () => {
    Object.values(nodeEffects).forEach((effect) => {
      effect.groupSizeOnce?.forEach((e) => expect(groupIds.has(e.groupId)).toBe(true));
      effect.groupSizePerSemester?.forEach((e) => expect(groupIds.has(e.groupId)).toBe(true));
    });
  });

  it("todo id de nó/grupo citado em eventos existe", () => {
    const conditionIds = (c: { nodeId?: string; nodeIds?: string[]; groupId?: string }) => {
      if (c.nodeId) expect(nodeIdSet.has(c.nodeId)).toBe(true);
      c.nodeIds?.forEach((id) => expect(nodeIdSet.has(id)).toBe(true));
      if (c.groupId) expect(groupIds.has(c.groupId)).toBe(true);
    };
    events.forEach((e) => {
      if (e.blockedByNode) expect(nodeIdSet.has(e.blockedByNode)).toBe(true);
      e.triggers.forEach((t) => {
        t.conditions.forEach(conditionIds);
        if (t.conditionalMultiplier) conditionIds(t.conditionalMultiplier.condition);
      });
      [e.effects, e.options?.a.effects, e.options?.b.effects].filter((x): x is typeof e.effects => x !== undefined).forEach((eff) => {
        eff.groups?.forEach((g) => expect(groupIds.has(g.groupId)).toBe(true));
        eff.sizes?.forEach((g) => expect(groupIds.has(g.groupId)).toBe(true));
      });
    });
  });

  it("todo evento (sorteado e de sistema) tem chave i18n pt-BR e en", () => {
    const allIds = [...events.map((e) => e.id), ...systemEvents.map((e) => e.id)];
    allIds.forEach((id) => {
      (["pt-BR", "en"] as const).forEach((locale) => {
        const entry = locales[locale].event[id];
        expect(entry?.title).toBeTruthy();
        expect(entry?.body).toBeTruthy();
      });
    });
    events.filter((e) => e.options).forEach((e) => {
      (["pt-BR", "en"] as const).forEach((locale) => {
        const entry = locales[locale].event[e.id];
        expect(entry?.option?.a).toBeTruthy();
        expect(entry?.option?.b).toBeTruthy();
      });
    });
  });
});
