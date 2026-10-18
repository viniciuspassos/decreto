import { fireEvent, render, screen } from "@testing-library/react";
import "./i18n/index";
import { App } from "./App";
import { newGame } from "./api/mockApi";
import { Election } from "./screens/Election";
import { polar, ringRadius, spokeAngle } from "./components/RadialMap";
import { semesterOf, turnInTerm, yearOf } from "./components/TopBar";
import { formatIndicator, signed } from "./components/format";

describe("App (v0 com backend mockado)", () => {
  it("toma posse, enfileira uma política, encerra o semestre e vê o resumo", () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Helena" } });
    fireEvent.click(screen.getByText("Tomar posse"));
    fireEvent.click(screen.getByText("Registro obrigatório"));
    fireEvent.click(screen.getByText("Adicionar ao turno · 20"));
    expect(screen.getByText("1/6")).toBeTruthy();
    fireEvent.click(screen.getByText(/Encerrar semestre/));
    expect(screen.getByText("Semestre encerrado")).toBeTruthy();
  });

  it("abre grupos e regimes a partir da rede", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Continuar"));
    fireEvent.click(screen.getByText("Grupos de eleitores"));
    expect(screen.getByText("Opinião pública")).toBeTruthy();
    fireEvent.click(screen.getByText(/Voltar à rede/));
    fireEvent.click(screen.getByText("Regimes e utopias"));
    expect(screen.getByText("Utopias")).toBeTruthy();
  });
});

describe("Election", () => {
  it("marca e desmarca promessas e atualiza o botão de votar", () => {
    const game = { ...newGame("Vessária", "Helena", "unstable"), turn: 9 };
    render(<Election game={game} lost={false} onVote={() => undefined} />);
    const card = screen.getByText("Ampliação da rede pública").closest("button");
    if (!card) throw new Error("cartão não encontrado");
    fireEvent.click(card);
    expect(card.className).toContain("on");
    expect(screen.getByText("Ir às urnas · 1 promessa")).toBeTruthy();
    fireEvent.click(card);
    expect(card.className).not.toContain("on");
  });
});

describe("helpers de UI", () => {
  it("geometria radial: anel cresce com a profundidade e o 1º raio aponta para cima", () => {
    expect(ringRadius(2)).toBeGreaterThan(ringRadius(1));
    const top = polar(spokeAngle(0, 25), 100);
    expect(top.x).toBeCloseTo(500);
    expect(top.y).toBeCloseTo(400);
  });

  it("calendário: turno 3 = ano 2, 1º semestre, turno 3 de 8", () => {
    expect([yearOf(3), semesterOf(3), turnInTerm(3)]).toEqual([2, 1, 3]);
    expect(turnInTerm(9)).toBe(1);
  });

  it("formata indicadores e variações", () => {
    expect(formatIndicator("gdp", 1.8)).toBe("+1.8%");
    expect(formatIndicator("crime", 38)).toBe("38");
    expect(signed(-3)).toBe("▼3");
  });
});
