import { useTranslation } from "react-i18next";
import { historicalFigures } from "@decreto/game-content";
import type { GameEvent, GameState } from "@decreto/shared-types";
import { semesterOf, yearOf } from "../components/TopBar.js";
import { signed } from "../components/format.js";

export function EventScreen({ game, event, onContinue }: { game: GameState; event: GameEvent; onContinue: () => void }) {
  const { t } = useTranslation();
  const figure = historicalFigures.find((f) => f.id === event.figureId);
  const policy = t(`node.${event.nodeId}`);
  const turn = game.turn - 1;

  return (
    <div className="screen event">
      <div className="photo"><span>{t("event.photo")}</span></div>
      <aside className="col side">
        <small className="eyebrow">
          <span className="tag">{t("event.when", { year: yearOf(turn), semester: semesterOf(turn) })}</span> {t("event.label")}
        </small>
        <h1>{t("event.headline", { policy })}</h1>
        <p>{t("event.body", { policy, country: game.country })}</p>
        <small className="eyebrow">{t("event.consequences")}</small>
        {event.consequences.map((c) => (
          <div key={c.groupId} className="row"><span>{t(`group.${c.groupId}`)}</span><b>{signed(c.delta)}</b></div>
        ))}
        {figure && (
          <div className="panel accent-border">
            <small className="eyebrow accent">{t("event.precedent")}</small>
            <h2>≈ {figure.figure}</h2>
          </div>
        )}
        <div className="spacer" />
        <button className="btn primary" onClick={onContinue}>{t("event.continue")}</button>
      </aside>
    </div>
  );
}
