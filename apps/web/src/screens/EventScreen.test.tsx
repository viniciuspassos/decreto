import { render, screen } from "@testing-library/react";
import type { CountryEvent } from "@decreto/shared-types";
import i18n from "../i18n/index.js";
import { EventScreen } from "./EventScreen.js";

describe("EventScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("pt-BR");
  });

  it("shows the translated title and image for a marked event", () => {
    const event: CountryEvent = {
      id: "infrastructure-collapse",
      turn: 2,
      pending: false,
      image: true,
    };

    render(<EventScreen event={event} onContinue={() => undefined} />);

    expect(screen.getByRole("heading", { name: "Infraestrutura pública dá sinais de colapso" })).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "/api/events/infrastructure-collapse/image");
  });
});
