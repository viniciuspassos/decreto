import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18n from "./i18n/index.js";
import { App } from "./App.js";
import { actionRevealDuration } from "./components/actionAnimation.js";
import type { CampaignPromise, CountryEvent, EndGameResult } from "@decreto/shared-types";
import { gameFixture } from "./test/gameFixture.js";
import { TREE_ANGLES, polar, ringRadius } from "./components/RadialMap.js";
import { semesterOf, turnInTerm, yearOf } from "./components/TopBar.js";
import { formatIndicator, formatPercent, signed } from "./components/format.js";

class FakeGameServer {
  readonly requests: string[] = [];
  game = gameFixture();
  failPreview = false;
  failEndConflict = false;
  failCampaign = false;
  failElectionPreview = false;
  savedStatus: number | null = null;
  events: CountryEvent[] = [];
  semesterEnd: EndGameResult | null = null;
  voteWon = true;
  voteEnd: EndGameResult | null = null;
  delaySavedGet = false;
  delayChosenPreview = false;
  campaignOptions: CampaignPromise[] = [{ nodeId: "privatizations", gains: [], loses: [] }];
  private resolveSavedGet: ((response: Response) => void) | null = null;
  private resolveChosenPreview: ((response: Response) => void) | null = null;
  completeSavedGet(status: number): void {
    this.resolveSavedGet?.(this.respond({ code: "game_not_found" }, status));
  }
  completeChosenPreview(votes: number): void {
    this.resolveChosenPreview?.(this.respond({ votes, honeymoon: false }));
  }
  fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const path = String(input);
    this.requests.push(path);
    if (path === "/api/games/deleted-game" && this.delaySavedGet)
      return new Promise<Response>((resolve) => { this.resolveSavedGet = resolve; });
    if (path.endsWith("/campaign")) {
      if (init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}")) as { promises?: string[] };
        this.game = { ...this.game, phase: this.voteEnd ? "ended" : "playing", turn: this.voteWon ? 9 : 17, term: this.voteWon ? 2 : 3, promises: this.voteWon ? body.promises ?? [] : [],
          campaignPromises: undefined, version: this.game.version + 1 };
        return this.respond({ game: this.game, won: this.voteWon, promises: body.promises ?? [], end: this.voteEnd });
      }
      if (this.failCampaign) return this.respond({ code: "network_error" }, 503);
      return this.respond({ options: this.campaignOptions, maxPromises: 3 });
    }
    if (path.endsWith("/election/preview")) {
      const body = JSON.parse(String(init?.body ?? "{}")) as { promises?: string[] };
      if (this.delayChosenPreview && body.promises?.length)
        return new Promise<Response>((resolve) => { this.resolveChosenPreview = resolve; });
      if (this.failElectionPreview) return this.respond({ code: "validation_error" }, 400);
      return this.respond({ votes: 55, honeymoon: false });
    }
    if (path.endsWith("/election")) {
      const body = JSON.parse(String(init?.body ?? "{}")) as { promises?: string[] };
      this.game = { ...this.game, phase: this.voteEnd ? "ended" : "playing", version: 2, turn: this.voteWon ? 9 : 17, term: this.voteWon ? 2 : 3,
        promises: this.voteWon ? body.promises ?? [] : [], end: this.voteEnd };
      return this.respond({ game: this.game, won: this.voteWon, promises: body.promises ?? [], end: this.voteEnd });
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
      const turn = this.game.turn + 1;
      const phase = turn > this.game.term * 8 ? "campaign" : "playing";
      this.game = { ...this.game, turn, version: this.game.version + 1, phase: this.semesterEnd ? "ended" : phase,
        end: this.semesterEnd, activeNodes: ["privatizations"], nodes: {
          ...this.game.nodes, privatizations: { status: "active", cost: null },
        } };
      return this.respond({ game: this.game, report: { applied: ["privatizations"], approvalBefore: 50,
        capitalBefore: 60, indicatorsBefore: this.game.indicators, groupChanges: [],
        risks: { coup: 0, attack: 0, revolution: 0, rebels: 0 }, events: this.events },
        events: this.events, end: this.semesterEnd });
    }
    if (path === "/api/games") return this.respond(this.game, 201);
    if (this.savedStatus) return this.respond({ code: this.savedStatus === 404 ? "game_not_found" : "internal_error" }, this.savedStatus);
    return this.respond(this.game);
  };
  respond(body: unknown, status = 200): Response {
    return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
  }
}

describe("App with API", () => {
  const originalFetch = global.fetch;
  beforeEach(async () => { localStorage.clear(); await i18n.changeLanguage("pt-BR"); });
  afterEach(() => { global.fetch = originalFetch; });

  it("lets the player change language and country before creating a game", async () => {
    const server = new FakeGameServer();
    global.fetch = server.fetch;
    render(<App />);
    fireEvent.click(screen.getByText("EN"));
    fireEvent.change(screen.getByDisplayValue("República de Vessária"), { target: { value: "Newland" } });
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Alex" } });
    fireEvent.click(screen.getByText("Take office"));
    await screen.findByText("This semester's actions");
    expect(server.requests).toContain("/api/games");
  });

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
    await waitFor(() => expect(document.querySelector("line.action-pulse")).toBeTruthy());
    expect(screen.queryByText("Semestre encerrado")).toBeNull();
    await screen.findByText("Semestre encerrado");
    expect(server.requests).toContain("/api/games/game-1/preview");
    expect(server.requests).toContain("/api/games/game-1/end-semester");
  });

  it("shows groups and regimes, then returns to the policy map", async () => {
    const server = new FakeGameServer();
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    fireEvent.click(await screen.findByText("Grupos de eleitores"));
    expect(screen.getByText("Opinião pública")).toBeTruthy();
    fireEvent.click(screen.getByText(/Voltar à rede/));
    fireEvent.click(screen.getByText("Regimes e utopias"));
    expect(screen.getByText("Utopias")).toBeTruthy();
  });

  it("shows only the four requested economic indicators", async () => {
    const server = new FakeGameServer();
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    await screen.findByText("Ações deste semestre");
    expect(screen.getByText("PIB")).toBeTruthy();
    expect(screen.getByText("Desemprego")).toBeTruthy();
    expect(screen.getByText("Inflação")).toBeTruthy();
    expect(screen.getByText("Dívida (% PIB)")).toBeTruthy();
    expect(screen.queryByText("Criminalidade")).toBeNull();
    expect(screen.queryByText("+5 indicadores ▾")).toBeNull();
  });

  it("shows every server event after the report and then returns to play", async () => {
    const server = new FakeGameServer();
    server.events = [
      { id: "good-harvest", turn: 1, pending: false, image: true },
      { id: "coup-rumors", turn: 1, pending: true },
    ];
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    fireEvent.click(await screen.findByText(/Encerrar semestre/));
    await screen.findByText("Semestre encerrado");
    expect(screen.queryByText("Safra recorde alivia os preços dos alimentos")).toBeNull();
    fireEvent.click(screen.getByText(/Iniciar próximo semestre/));
    expect(screen.getByText("Safra recorde alivia os preços dos alimentos")).toBeTruthy();
    expect(screen.getByAltText("foto duotone · imagem sóbria (sem violência)")).toBeTruthy();
    expect(screen.getByText("Evento marcante")).toBeTruthy();
    fireEvent.click(screen.getByText("Continuar"));
    expect(screen.getByText("Rumores de golpe circulam nos quartéis")).toBeTruthy();
    expect(screen.getByText("Notícia do turno")).toBeTruthy();
    expect(screen.getByText("Decisão pendente.")).toBeTruthy();
    fireEvent.click(screen.getByText("Continuar"));
    expect(screen.getByText("Ações deste semestre")).toBeTruthy();
    expect(document.querySelector("line.action-traveled")).toBeTruthy();
  });

  it("shows the API end result after the report and events", async () => {
    const server = new FakeGameServer();
    server.semesterEnd = { outcome: "defeat", reason: "coup", ranking: [], topTrees: [] };
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    fireEvent.click(await screen.findByText(/Encerrar semestre/));
    await screen.findByText("Semestre encerrado");
    fireEvent.click(screen.getByText(/Iniciar próximo semestre/));
    expect(screen.getByText(/Derrota/)).toBeTruthy();
    fireEvent.click(screen.getByText("Nova partida"));
    expect(screen.getByText("Tomar posse")).toBeTruthy();
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
    const voteButton = screen.getByText("Ir às urnas · 1 promessa");
    await waitFor(() => expect(voteButton).not.toBeDisabled());
    fireEvent.click(voteButton);
    await screen.findByText("Você foi reeleito");
    expect(server.requests).toContain("/api/games/game-1/campaign");
    expect(server.requests).toContain("/api/games/game-1/election/preview");
    expect(server.requests).toContain("/api/games/game-1/election");
  });

  it("finishes the final semester before campaign and shows a read-only election result", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, turn: 8 };
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    expect(await screen.findByText("Ações deste semestre")).toBeTruthy();
    expect(screen.queryByText("Escolha até 3 promessas")).toBeNull();
    fireEvent.click(screen.getByText(/Encerrar semestre/));
    await screen.findByText("Semestre encerrado");
    fireEvent.click(screen.getByText(/Iniciar próximo semestre/));
    await screen.findByText("Escolha até 3 promessas");
    fireEvent.click(await screen.findByText("Privatizações"));
    const confirm = await screen.findByRole("button", { name: "Confirmar 1 promessa e fazer a eleição" });
    await waitFor(() => expect(confirm).not.toBeDisabled());
    fireEvent.click(confirm);
    expect(await screen.findByText("Você foi reeleito")).toBeTruthy();
    expect(screen.getByText("Promessas feitas")).toBeTruthy();
    expect(screen.getByText("Privatizações")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Privatizações" })).toBeNull();
    expect(server.requests).toContain("/api/games/game-1/campaign");
    expect(server.requests).not.toContain("/api/games/game-1/election");
    fireEvent.click(screen.getByText("Iniciar próximo semestre"));
    expect(screen.getByText("Ações deste semestre")).toBeTruthy();
    expect(screen.queryByText("Escolha até 3 promessas")).toBeNull();
  });

  it("shows a saved end result from the API", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, phase: "ended", end: { outcome: "defeat", reason: "coup", ranking: [], topTrees: [] } };
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    expect(await screen.findByText(/Derrota/)).toBeTruthy();
    fireEvent.click(screen.getByText("Nova partida"));
    expect(localStorage.getItem("decreto.gameId")).toBeNull();
  });

  it("waits for the latest projection before enabling the vote", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, phase: "election", turn: 9 };
    server.delayChosenPreview = true;
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    await screen.findByText("55%");
    fireEvent.click(screen.getByText("Privatizações"));
    const voteButton = screen.getByText("Ir às urnas · 1 promessa");
    expect(voteButton).toBeDisabled();
    expect(screen.queryByText("55%")).toBeNull();
    server.completeChosenPreview(40);
    await screen.findByText("40%");
    expect(voteButton).not.toBeDisabled();
  });

  it("keeps the projection when a fourth promise exceeds the campaign limit", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, phase: "election", turn: 9 };
    server.campaignOptions = ["privatizations", "harsher-sentences", "mandatory-registration", "easier-visas"]
      .map((nodeId) => ({ nodeId, gains: [], loses: [] }));
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    await screen.findByText("Escolha até 3 promessas");
    await waitFor(() => expect(document.querySelectorAll(".cards .card")).toHaveLength(4));
    const readyCards = document.querySelectorAll(".cards .card");
    [0, 1, 2].forEach((index) => fireEvent.click(readyCards[index]!));
    const voteButton = screen.getByText("Ir às urnas · 3 promessas");
    await waitFor(() => expect(voteButton).not.toBeDisabled());
    fireEvent.click(readyCards[3]!);
    expect(voteButton).not.toBeDisabled();
    expect(screen.getByText("55%")).toBeTruthy();
  });

  it("shows campaign and projection errors without sending a vote", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, phase: "election", turn: 9, promises: ["privatizations"] };
    server.failCampaign = true;
    server.failElectionPreview = true;
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Escolha inválida|Ocorreu um erro/);
    expect(screen.getByText("Privatizações")).toBeTruthy();
    expect(screen.getByText("não cumprida")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Fechar aviso"));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Ir às urnas · 0 promessa")).toBeDisabled();
    expect(server.requests).not.toContain("/api/games/game-1/election");
  });

  it("shows the election result after losing and continues to the next semester", async () => {
    const server = new FakeGameServer();
    server.game = { ...server.game, phase: "campaign", turn: 9 };
    server.voteWon = false;
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    fireEvent.click(await screen.findByText("Continuar"));
    await screen.findByText("Escolha até 3 promessas");
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar 0 promessa e fazer a eleição" }));
    expect(await screen.findByText(/Você perdeu a eleição/)).toBeTruthy();
    expect(screen.getByText("Você não foi eleito")).toBeTruthy();
    fireEvent.click(screen.getByText("Iniciar próximo semestre"));
    expect(screen.getByText("Ações deste semestre")).toBeTruthy();
    expect(server.requests.filter((path) => path.endsWith("/campaign"))).toHaveLength(2);
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

  it("ignores a delayed old save failure after creating a new game", async () => {
    const server = new FakeGameServer();
    server.delaySavedGet = true;
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "deleted-game");
    render(<App />);
    await waitFor(() => expect(server.requests).toContain("/api/games/deleted-game"));
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Helena" } });
    fireEvent.click(screen.getByText("Tomar posse"));
    await screen.findByText("Ações deste semestre");
    server.completeSavedGet(404);
    await waitFor(() => expect(localStorage.getItem("decreto.gameId")).toBe("game-1"));
    expect(screen.getByText("Ações deste semestre")).toBeTruthy();
  });

  it("discards a missing saved ID and still allows a new game", async () => {
    const server = new FakeGameServer();
    server.savedStatus = 404;
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "deleted-game");
    render(<App />);
    await waitFor(() => expect(localStorage.getItem("decreto.gameId")).toBeNull());
    expect(screen.queryByText("Continuar")).toBeNull();
    expect(screen.getByText("Tomar posse")).toBeTruthy();
  });

  it("shows a recoverable error when loading a saved game fails", async () => {
    const server = new FakeGameServer();
    server.savedStatus = 500;
    global.fetch = server.fetch;
    localStorage.setItem("decreto.gameId", "game-1");
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Ocorreu um erro");
    fireEvent.click(screen.getByLabelText("Fechar aviso"));
    expect(screen.queryByRole("alert")).toBeNull();
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

describe("actionRevealDuration", () => {
  it("waits for the last staggered pulse to finish", () => {
    expect(actionRevealDuration(1)).toBe(800);
    expect(actionRevealDuration(6)).toBe(1700);
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
    expect(formatIndicator("gdp", 1.8)).toBe("+2%");
    expect(formatIndicator("gdp", -1.6)).toBe("-2%");
    expect(formatIndicator("gdp", -1.5)).toBe("-2%");
    expect(formatIndicator("inflation", 2.49)).toBe("2%");
    expect(formatPercent(42.5)).toBe("43%");
    expect(formatPercent(42.49)).toBe("42%");
    expect(signed(-3)).toBe("▼3");
    expect(signed(0.4)).toBe("0");
  });
});
