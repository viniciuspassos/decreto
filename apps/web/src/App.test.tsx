import { render, screen } from "@testing-library/react";
import "./i18n/index.js";
import { App } from "./App.js";

describe("App", () => {
  it("mostra o título Decreto e o tagline traduzido", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Decreto" })).toBeInTheDocument();
    expect(screen.getByText("Governe. Decida. Dure.")).toBeInTheDocument();
  });
});
