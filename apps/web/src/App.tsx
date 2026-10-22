import { useEffect, useState } from "react";
import type { CountryEvent, EndGameResult, SemesterReport } from "@decreto/shared-types";
import { useGame } from "./api/useGame.js";
import { actionRevealDuration } from "./components/actionAnimation.js";
import { ErrorBanner } from "./components/ErrorBanner.js";
import { EndedNotice } from "./components/EndedNotice.js";
import { Election } from "./screens/Election.js";
import { ElectionResult } from "./screens/ElectionResult.js";
import { EndGame } from "./screens/EndGame.js";
import { EventScreen } from "./screens/EventScreen.js";
import { Groups } from "./screens/Groups.js";
import { Home } from "./screens/Home.js";
import { Main } from "./screens/Main.js";
import { Regimes } from "./screens/Regimes.js";
import { Summary } from "./screens/Summary.js";

type Screen =
  | { name: "home" | "groups" | "regimes" }
  | { name: "main" }
  | { name: "action-reveal"; report: SemesterReport; events: CountryEvent[]; end: EndGameResult | null; previouslyActive: string[] }
  | { name: "summary"; report: SemesterReport; events: CountryEvent[]; end: EndGameResult | null }
  | { name: "event"; events: CountryEvent[]; index: number; end: EndGameResult | null; applied: string[] }
  | { name: "election-result"; won: boolean; reelected: boolean; promises: string[]; end: EndGameResult | null }
  | { name: "end"; result: EndGameResult };

export function App() {
  const session = useGame();
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [lost, setLost] = useState(false);
  const game = session.game;
  const banner = <ErrorBanner code={session.error} onDismiss={() => session.setError(null)} />;

  useEffect(() => {
    if (screen.name !== "action-reveal") return;
    const duration = actionRevealDuration(screen.report.applied.length);
    const timer = window.setTimeout(() => setScreen({
      name: "summary", report: screen.report, events: screen.events, end: screen.end,
    }), duration);
    return () => window.clearTimeout(timer);
  }, [screen]);

  async function closeSemester(): Promise<void> {
    const previouslyActive = Object.entries(game?.nodes ?? {})
      .filter(([, node]) => node.status === "active").map(([nodeId]) => nodeId);
    const response = await session.finishSemester();
    if (!response) return;
    if (response.report.applied.length) {
      setScreen({ name: "action-reveal", report: response.report, events: response.events, end: response.end, previouslyActive });
    } else setScreen({ name: "summary", report: response.report, events: response.events, end: response.end });
  }

  async function vote(promises: string[]): Promise<void> {
    const response = await session.vote(promises);
    if (!response) return;
    setLost(!response.won);
    showElectionResult(response.won, promises, response.end);
  }

  async function submitCampaign(promises: string[]): Promise<void> {
    const response = await session.submitCampaign(promises);
    if (!response) return;
    setLost(!response.won);
    showElectionResult(response.won, response.promises, response.end);
  }

  function showElectionResult(won: boolean, promises: string[], end: EndGameResult | null): void {
    setScreen({ name: "election-result", won, reelected: wasIncumbent(game), promises, end });
  }

  function next(events: CountryEvent[], index: number, end: EndGameResult | null, applied: string[]): void {
    if (index < events.length) setScreen({ name: "event", events, index, end, applied });
    else if (end) setScreen({ name: "end", result: end });
    else setScreen({ name: "main" });
  }

  if (!game || screen.name === "home") {
    return <>{banner}<Home save={game} hasSave={Boolean(session.saveId)} pending={session.pending}
      onStart={async (request) => { if (await session.create(request)) setScreen({ name: "main" }); }}
      onResume={async () => { if (await session.resume()) setScreen({ name: "main" }); }} /></>;
  }

  if (isCampaignScreen(game.phase, screen)) {
    return <>{banner}<Election key={game.version} game={game} lost={lost} pending={session.pending}
      campaignOnly={game.phase === "campaign"} onCampaign={submitCampaign} onVote={vote} /></>;
  }
  if (screen.name === "election-result") {
    return <>{banner}<ElectionResult game={game} won={screen.won} reelected={screen.reelected}
      promises={screen.promises} onContinue={() => setScreen(screen.end ? { name: "end", result: screen.end } : { name: "main" })} /></>;
  }
  if (game.phase === "ended" && screen.name === "main" && game.end) {
    return <>{banner}<EndGame game={game} result={game.end}
      onRestart={() => { session.restart(); setScreen({ name: "home" }); }} /></>;
  }

  if (game.phase === "ended" && screen.name === "main") {
    return <>{banner}<EndedNotice onRestart={() => { session.restart(); setScreen({ name: "home" }); }} /></>;
  }
  return <>{banner}<GameScreens game={game} screen={screen} pending={session.pending}
    onBack={() => setScreen({ name: "main" })} onNext={next}
    onToggleQueue={(id) => void session.toggleQueue(id)} onClose={() => void closeSemester()}
    onOpen={(name) => setScreen({ name })} onRestart={() => { session.restart(); setScreen({ name: "home" }); }} /></>;
}

function wasIncumbent(game: ReturnType<typeof useGame>["game"]): boolean {
  if (!game) return false;
  const previousTerm = game.history[game.history.length - 1];
  return previousTerm ? previousTerm.inPower : true;
}

function isCampaignScreen(phase: NonNullable<ReturnType<typeof useGame>["game"]>["phase"], screen: Screen): boolean {
  return (phase === "campaign" || phase === "election") && screen.name === "main";
}

function GameScreens({ game, screen, pending, onBack, onNext, onToggleQueue, onClose, onOpen, onRestart }: {
  game: NonNullable<ReturnType<typeof useGame>["game"]>;
  screen: Screen;
  pending: boolean;
  onBack: () => void;
  onNext: (events: CountryEvent[], index: number, end: EndGameResult | null, applied: string[]) => void;
  onToggleQueue: (id: string) => void;
  onClose: () => void;
  onOpen: (name: "groups" | "regimes") => void;
  onRestart: () => void;
}) {
  switch (screen.name) {
    case "groups": return <Groups game={game} onBack={onBack} />;
    case "regimes": return <Regimes game={game} onBack={onBack} />;
    case "action-reveal": return <Main game={game} appliedActions={screen.report.applied}
      traveledThrough={screen.previouslyActive} pending
      onToggleQueue={onToggleQueue} onEndSemester={onClose} />;
    case "summary": return <Summary game={game} report={screen.report} onContinue={() => onNext(screen.events, 0, screen.end, screen.report.applied)} />;
    case "event": return <EventScreen event={screen.events[screen.index]!}
      onContinue={() => onNext(screen.events, screen.index + 1, screen.end, screen.applied)} />;
    case "end": return <EndGame game={game} result={screen.result} onRestart={onRestart} />;
    default: return <Main game={game} appliedActions={[]} pending={pending} onToggleQueue={onToggleQueue}
      onEndSemester={onClose} onOpen={onOpen} />;
  }
}
