import { fireEvent, render, screen } from "@testing-library/react";
import "./i18n/index.js";
import { App } from "./App.js";
import { newGame } from "./api/mockApi.js";
import { Election } from "./screens/Election.js";
import { TREE_ANGLES, polar, ringRadius } from "./components/RadialMap.js";
import { semesterOf, turnInTerm, yearOf } from "./components/TopBar.js";
import { formatIndicator, signed } from "./components/format.js";

describe("App (v0 with mocked backend)", () => {
  it("takes office, queues a policy, closes the semester, and views the summary", () => {
    render(<App />);
    fireEvent.change(screen.getByDisplayValue("República de Vessária"), { target: { value: "Vessária" } });
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Helena" } });
    fireEvent.click(screen.getByText("Tomar posse"));
    fireEvent.click(screen.getByText("Registro obrigatório"));
    fireEvent.click(screen.getByText("Adicionar ao turno · 20"));
    expect(screen.getByText("1/6")).toBeTruthy();
    fireEvent.click(screen.getByText(/Encerrar semestre/));
    expect(screen.getByText("Semestre encerrado")).toBeTruthy();
  });

  it("opens groups and regimes from the network", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Continuar"));
    fireEvent.click(screen.getByText("Grupos de eleitores"));
    expect(screen.getByText("Opinião pública")).toBeTruthy();
    fireEvent.click(screen.getByText("Religiosos"));
    expect(screen.getByText("Liberdades individuais")).toBeTruthy();
    fireEvent.click(screen.getByText(/Voltar à rede/));
    fireEvent.click(screen.getByText("Regimes e utopias"));
    expect(screen.getByText("Utopias")).toBeTruthy();
  });

  it("plays a full game: event, elections with promises, and game end", () => {
    const clickIf = (re: RegExp) => {
      const [el] = screen.queryAllByText(re);
      if (el) fireEvent.click(el);
      return el !== undefined;
    };
    render(<App />);
    fireEvent.click(screen.getByText("Continuar"));
    fireEvent.click(screen.getByText("+5 indicadores ▾"));
    expect(screen.getByText("Corrupção")).toBeTruthy();
    fireEvent.click(screen.getByText("Prender opositores"));
    fireEvent.click(screen.getByText("Adicionar ao turno · 48"));
    fireEvent.click(screen.getByText(/Encerrar semestre/));
    fireEvent.click(screen.getByText(/Iniciar próximo semestre/));
    expect(screen.getByText("≈ Emílio Garrastazu Médici")).toBeTruthy();
    fireEvent.click(screen.getByText("Continuar"));
    for (let i = 0; i < 400 && !screen.queryByText("Nova partida"); i++) {
      if (screen.queryByText("Escolha até 3 promessas")) {
        clickIf(/^Remédios gratuitos$/);
        fireEvent.click(screen.getByText(/Ir às urnas/));
      } else if (!clickIf(/Encerrar semestre/) && !clickIf(/Iniciar próximo semestre/)) {
        clickIf(/^Continuar$/);
      }
    }
    expect(screen.getByText("Você governou com semelhanças com")).toBeTruthy();
    fireEvent.click(screen.getByText("Nova partida"));
    expect(screen.getByText("Tomar posse")).toBeTruthy();
  });
});

describe("Election", () => {
  it("toggles promises and updates the vote button", () => {
    const game = { ...newGame("Vessária", "Helena", "unstable"), turn: 9 };
    render(<Election game={game} lost={false} onVote={() => undefined} />);
    const card = screen.getByText("Ampliação da rede pública").closest("button");
    if (!card) throw new Error("Card not found");
    fireEvent.click(card);
    expect(card.className).toContain("on");
    expect(screen.getByText("Ir às urnas · 1 promessa")).toBeTruthy();
    fireEvent.click(card);
    expect(card.className).not.toContain("on");
  });
});

describe("UI helpers", () => {
  it("radial geometry: the ring grows with depth and the first radius points up", () => {
    expect(ringRadius(2)).toBeGreaterThan(ringRadius(1));
    const top = polar(TREE_ANGLES[0] ?? 0, 100);
    expect(top.x).toBeCloseTo(700);
    expect(top.y).toBeCloseTo(600);
  });

  it("calendar: turn 3 = year 2, semester 1, turn 3 of 8", () => {
    expect([yearOf(3), semesterOf(3), turnInTerm(3)]).toEqual([2, 1, 3]);
    expect(turnInTerm(9)).toBe(1);
  });

  it("formats indicators and changes", () => {
    expect(formatIndicator("gdp", 1.8)).toBe("+1.8%");
    expect(formatIndicator("crime", 38)).toBe("38");
    expect(signed(-3)).toBe("▼3");
  });
});
