import { useState } from "react";
import type { CampaignPromise, EndGameResult, GameEvent, GameState, SemesterReport } from "@decreto/shared-types";
import { checkEnd, endGame, endSemester, isElectionTurn, runElection } from "./api/mockApi.js";
import { Election } from "./screens/Election.js";
import { EndGame } from "./screens/EndGame.js";
import { EventScreen } from "./screens/EventScreen.js";
import { Groups } from "./screens/Groups.js";
import { Home } from "./screens/Home.js";
import { Main } from "./screens/Main.js";
import { Regimes } from "./screens/Regimes.js";
import { Summary } from "./screens/Summary.js";

type Screen =
  | { name: "home" | "main" | "groups" | "regimes" }
  | { name: "summary"; report: SemesterReport; event: GameEvent | null }
  | { name: "event"; event: GameEvent }
  | { name: "election"; lost: boolean }
  | { name: "end"; result: EndGameResult };

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  if (!game || screen.name === "home") {
    return <Home onStart={(g) => { setGame(g); setScreen({ name: "main" }); }} />;
  }

  /** `won` só vem preenchido logo após uma eleição. */
  const afterTurn = (g: GameState, won?: boolean): Screen => {
    const reason = checkEnd(g);
    if (reason) return { name: "end", result: endGame(g, reason) };
    if (won !== undefined) return won ? { name: "main" } : { name: "election", lost: true };
    return isElectionTurn(g) ? { name: "election", lost: false } : { name: "main" };
  };
  const finishSemester = () => {
    const { state, report, event } = endSemester(game);
    setGame(state);
    setScreen({ name: "summary", report, event });
  };
  const vote = (promises: CampaignPromise[]) => {
    const { state, won } = runElection(game, promises);
    setGame(state);
    setScreen(afterTurn(state, won));
  };
  const back = () => setScreen({ name: "main" });

  switch (screen.name) {
    case "groups":
      return <Groups game={game} onBack={back} />;
    case "regimes":
      return <Regimes game={game} onBack={back} />;
    case "summary":
      return (
        <Summary
          game={game}
          report={screen.report}
          onContinue={() => setScreen(screen.event ? { name: "event", event: screen.event } : afterTurn(game))}
        />
      );
    case "event":
      return <EventScreen game={game} event={screen.event} onContinue={() => setScreen(afterTurn(game))} />;
    case "election":
      return <Election key={game.turn} game={game} lost={screen.lost} onVote={vote} />;
    case "end":
      return <EndGame game={game} result={screen.result} onRestart={() => setScreen({ name: "home" })} />;
    default:
      return <Main game={game} onChange={setGame} onEndSemester={finishSemester} onOpen={(name) => setScreen({ name })} />;
  }
}
