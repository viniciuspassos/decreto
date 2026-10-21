import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "./i18n/index.js";
import { App } from "./App.js";
import { gameFixture } from "./test/gameFixture.js";
import { TREE_ANGLES, polar, ringRadius } from "./components/RadialMap.js";
import { semesterOf, turnInTerm, yearOf } from "./components/TopBar.js";
import { formatIndicator, signed } from "./components/format.js";

class FakeGameServer {
  readonly requests: string[] = [];
  game = gameFixture();
  failPreview = false;
  failEndConflict = false;
  fetch = async (input: RequestInfo | URL): Promise<Response> => {
    const path = String(input);
    this.requests.push(path);
    if (path.endsWith("/campaign")) return this.respond({ options: [{ nodeId: "privatizations", gains: [], loses: [] }], maxPromises: 3 });
    if (path.endsWith("/election/preview")) return this.respond({ votes: 55, honeymoon: false });
    if (path.endsWith("/election")) {
      this.game = { ...this.game, phase: "playing", version: 2, term: 2 };
      return this.respond({ game: this.game, won: true, end: null });
    }
    if (path.endsWith("/preview")) {
      if (this.failPreview) return this.respond({ code: "invalid_queue" }, 400);
      return this.respond({ nodes: this.game.nodes, totalCost: 20, remaining: 40, errors: [] });
    }
    if (path.endsWith("/end-semester")) {
      if (this.failEndConflict) {
        this.game = { ...this.game, version: 2 };
        return this.respond({ code: "version_conflict" }, 409);
      }
      this.game = { ...this.game, turn: 2, version: 2, activeNodes: ["privatizations"] };
      return this.respond({ game: this.game, report: { applied: ["privatizations"], approvalBefore: 50,
        capitalBefore: 60, indicatorsBefore: this.game.indicators, groupChanges: [],
        risks: { coup: 0, attack: 0, revolution: 0, rebels: 0 }, events: [] }, events: [], end: null });
    }
    if (path === "/api/games") return this.respond(this.game, 201);
    return this.respond(this.game);
  };
  respond(body: unknown, status = 200): Response {
    return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
  }
}

describe("App with API", () => {
  const originalFetch = global.fetch;
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { global.fetch = originalFetch; });

  it("creates a game, previews a queued action, and shows the server report", async () => {
    const server = new FakeGameServer();
    global.fetch = server.fetch;
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Helena" } });
    fireEvent.click(screen.getByText("Tomar posse"));
    await screen.findByText("Ações deste semestre");
    fireEvent.click(screen.getByText("Privatizações"));
    fireEvent.click(screen.getByText("Adicionar ao turno · 20"));
    await waitFor(() => expect(screen.getByText("1/6")).toBeTruthy());
    fireEvent.click(screen.getByText(/Encerrar semestre/));
    await screen.findByText("Semestre encerrado");
    expect(server.requests).toContain("/api/games/game-1/preview");
    expect(server.requests).toContain("/api/games/game-1/end-semester");
  });

  it("reloads authoritative state after version conflict and clears queue", async () => {
    const server = new FakeGameServer();
    server.failEndConflict = true;
    global.fetch = server.fetch;
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Helena" } });
    fireEvent.click(screen.getByText("Tomar posse"));
    await screen.findByText("Ações deste semestre");
    fireEvent.click(screen.getByText("Privatizações"));
    fireEvent.click(screen.getByText("Adicionar ao turno · 20"));
    await waitFor(() => expect(screen.getByText("1/6")).toBeTruthy());
    fireEvent.click(screen.getByText(/Encerrar semestre/));
    expect(await screen.findByRole("alert")).toHaveTextContent("A partida mudou em outra aba");
    await waitFor(() => expect(screen.getByText("0/6")).toBeTruthy());
    expect(server.requests.filter((path) => path === "/api/games/game-1").length).toBeGreaterThan(0);
  });

  it("loads campaign choices and projections from API before voting", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, phase: "election", turn: 9 };
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    await screen.findByText("Escolha até 3 promessas");
    expect(await screen.findByText("55%")).toBeTruthy();
    fireEvent.click(screen.getByText("Privatizações"));
    fireEvent.click(screen.getByText("Ir às urnas · 1 promessa"));
    await screen.findByText("Ações deste semestre");
    expect(server.requests).toContain("/api/games/game-1/campaign");
    expect(server.requests).toContain("/api/games/game-1/election/preview");
    expect(server.requests).toContain("/api/games/game-1/election");
  });

  it("shows a safe ended screen when an old ended save lacks a result", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, phase: "ended", end: null };
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    expect(await screen.findByText("Partida encerrada.")).toBeTruthy();
    fireEvent.click(screen.getByText("Nova partida"));
    expect(localStorage.getItem("decreto.gameId")).toBeNull();
  });

  it("loads saved game from API and shows localized preview failure", async () => {
    const server = new FakeGameServer();
    server.failPreview = true;
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    await screen.findByText("Ações deste semestre");
    fireEvent.click(screen.getByText("Privatizações"));
    fireEvent.click(screen.getByText("Adicionar ao turno · 20"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Esta fila não é válida");
    expect(screen.getByText("0/6")).toBeTruthy();
  });
});

describe("UI helpers", () => {
  it("places radial rings", () => {
    expect(ringRadius(2)).toBeGreaterThan(ringRadius(1));
    expect(polar(TREE_ANGLES[0] ?? 0, 100)).toEqual({ x: 700, y: 600 });
  });
  it("computes the term calendar", () => {
    expect([yearOf(3), semesterOf(3), turnInTerm(3)]).toEqual([2, 1, 3]);
  });
  it("formats indicators", () => {
    expect(formatIndicator("gdp", 1.8)).toBe("+1.8%");
    expect(signed(-3)).toBe("▼3");
  });
});
