import {
  MAX_ACTIONS,
  activeCount,
  campaignOptions,
  checkEnd,
  depthOf,
  endGame,
  endSemester,
  isElectionTurn,
  loadSave,
  newGame,
  nodeCost,
  nodeStatus,
  projectVotes,
  queuedCost,
  runElection,
  toggleQueued,
  treeOf,
} from "./mockApi";

const fresh = () => ({ ...newGame("Vessária", "Helena", "unstable"), capital: 1000 });

describe("mockApi", () => {
  it("custo segue o exemplo do S3: prender opositores = 48", () => {
    expect(depthOf("arrest-opponents")).toBe(3);
    expect(nodeCost("arrest-opponents")).toBe(48);
    expect(nodeCost("secret-police")).toBe(20);
  });

  it("treeOf e activeCount localizam a árvore do nó", () => {
    expect(treeOf("torture")?.id).toBe("secret-police");
    expect(activeCount(loadSave(), "secret-police")).toBe(2);
  });

  it("nó só fica disponível com o anterior ativo e sem árvore oposta ativa", () => {
    const g = { ...fresh(), activeNodes: ["mandatory-registration"] };
    expect(nodeStatus(g, "mandatory-registration")).toBe("active");
    expect(nodeStatus(g, "carry-restriction")).toBe("available");
    expect(nodeStatus(g, "gun-buyback")).toBe("blocked");
    expect(nodeStatus(g, "easier-registration")).toBe("blocked");
    expect(nodeStatus(g, "lifetime-title")).toBe("blocked");
  });

  it("fila respeita 6 ações, capital e desfaz ao clicar de novo", () => {
    let g = fresh();
    g = toggleQueued(g, "secret-police");
    expect(nodeStatus(g, "secret-police")).toBe("queued");
    expect(queuedCost(g)).toBe(20);
    expect(toggleQueued(g, "secret-police").queue).toEqual([]);
    ["privatizations", "outsourcing", "emission-targets", "easier-visas", "public-cameras", "state-lottery"].forEach((n) => {
      g = toggleQueued(g, n);
    });
    expect(g.queue).toHaveLength(MAX_ACTIONS);
    expect(toggleQueued({ ...fresh(), capital: 10 }, "secret-police").queue).toEqual([]);
  });

  it("endSemester ativa a fila, cobra capital, avança turno e revela figura", () => {
    const g = toggleQueued(fresh(), "privatizations");
    const { state, report, event } = endSemester(g);
    expect(state.turn).toBe(2);
    expect(state.activeNodes).toContain("privatizations");
    expect(state.queue).toEqual([]);
    expect(state.capital).toBe(1000 - 20 + g.capitalPerTurn);
    expect(report.groupChanges.find((c) => c.id === "business")?.delta).toBe(4);
    expect(event?.figureId).toBe("fernando-henrique-cardoso");
  });

  it("eleição acontece no início de cada mandato após o primeiro", () => {
    expect(isElectionTurn({ ...fresh(), turn: 8 })).toBe(false);
    expect(isElectionTurn({ ...fresh(), turn: 9 })).toBe(true);
  });

  it("promessas: uma por campo, projeção e resultado da eleição", () => {
    const g = { ...fresh(), turn: 9 };
    const options = campaignOptions(g);
    expect(options).toHaveLength(6);
    expect(projectVotes(g, [])).toBe(50);
    const won = runElection({ ...g, approval: 60 }, options.slice(0, 1));
    expect(won.won).toBe(true);
    expect(won.state.term).toBe(2);
    const lost = runElection({ ...g, approval: 30 }, []);
    expect(lost.won).toBe(false);
    expect(lost.state.turn).toBe(17);
  });

  it("fim de jogo: golpe, 20 anos e 40 anos", () => {
    expect(checkEnd({ ...fresh(), approval: 10 })).toBe("coup");
    const history = Array.from({ length: 5 }, (_, i) => ({ term: i + 1, inPower: true }));
    expect(checkEnd({ ...fresh(), history })).toBe("twentyYears");
    expect(checkEnd({ ...fresh(), turn: 81 })).toBe("fortyYears");
    expect(checkEnd(fresh())).toBeNull();
  });

  it("endGame ranqueia figuras das políticas ativas", () => {
    const result = endGame(loadSave(), "twentyYears");
    expect(result.outcome).toBe("victory");
    expect(result.ranking[0]?.figureId).toBeDefined();
    expect(result.topTrees[0]).toBe("secret-police");
    expect(endGame(fresh(), "coup").ranking[0]?.figureId).toBe("nelson-mandela");
  });
});
