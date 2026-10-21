import { useTranslation } from "react-i18next";
import type { PlayableGame } from "../api/gameView.js";
import { TopBar } from "../components/TopBar.js";

interface Props {
  game: PlayableGame;
  won: boolean;
  reelected: boolean;
  promises: string[];
  onContinue: () => void;
}

export function ElectionResult({ game, won, reelected, promises, onContinue }: Props) {
  const { t } = useTranslation();
  const outcome = won ? (reelected ? "reelected" : "elected") : "notElected";
  return <div className="screen">
    <TopBar game={game} title={t("election.resultTitle")} />
    <div className="page">
      <small className="eyebrow accent">{t("election.resultEyebrow")}</small>
      <h1>{t(`election.${outcome}`)}</h1>
      {!won && <p className="muted">{t("election.lost")}</p>}
      <section className="panel">
        <small className="eyebrow">{t("election.madePromises")}</small>
        {promises.length === 0 && <p className="muted">{t("election.noPromisesMade")}</p>}
        {promises.map((id) => <div className="row" key={id}><span>{t(`node.${id}`)}</span></div>)}
      </section>
      <div className="row footer"><button className="btn primary" onClick={onContinue}>{t("election.continueAfterResult")}</button></div>
    </div>
  </div>;
}
