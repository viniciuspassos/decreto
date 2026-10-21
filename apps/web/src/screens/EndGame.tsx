import { useTranslation } from "react-i18next";
import { historicalFigures } from "@decreto/game-content";
import type { EndGameResult, GameState } from "@decreto/shared-types";
import { yearOf } from "../components/TopBar.js";
import { formatIndicator, formatPercent } from "../components/format.js";

const figureName = (id: string) => historicalFigures.find((f) => f.id === id)?.figure ?? id;

export function EndGame({ game, result, onRestart }: { game: GameState; result: EndGameResult; onRestart: () => void }) {
  const { t } = useTranslation();
  const [top] = result.ranking;

  return (
    <div className="screen event">
      <section className="page">
        <small className="eyebrow">
          <span className="tag">{t(`end.${result.outcome}`)} · {t(`end.reason.${result.reason}`)}</span> {t("end.year", { year: yearOf(game.turn) })}
        </small>
        <p className="muted">{t("end.lead")}</p>
        <h1 className="hero">{top ? figureName(top.figureId) : "—"}</h1>
        <div className="cols4">
          <div><small className="eyebrow">{t("end.terms")}</small><b>{game.term}</b></div>
          <div><small className="eyebrow">{t("end.approval")}</small><b>{formatPercent(game.approval)}</b></div>
          <div><small className="eyebrow">{t("indicator.gdp")}</small><b>{formatIndicator("gdp", game.indicators.gdp)}</b></div>
          <div><small className="eyebrow">{t("end.policies")}</small><b>{game.activeNodes.length}</b></div>
        </div>
        <small className="eyebrow">{t("end.timeline")}</small>
        <div className="timeline">
          {game.history.map((h, i) => (
            <span key={i} className={h.inPower ? "on" : ""}>{h.inPower ? t("end.term", { n: h.term }) : t("end.opposition")}</span>
          ))}
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={onRestart}>{t("end.restart")}</button>
      </section>
      <aside className="col side">
        <small className="eyebrow">{t("end.similarity")}</small>
        {result.ranking.map((r) => (
          <div key={r.figureId}>
            <div className="row"><b>{figureName(r.figureId)}</b><b>{formatPercent(r.similarity)}</b></div>
            <span className="bar"><i style={{ width: `${r.similarity}%` }} /></span>
          </div>
        ))}
        <small className="eyebrow">{t("end.topTrees")}</small>
        <div className="chips">{result.topTrees.map((id) => <span key={id}>{t(`tree.${id}`)}</span>)}</div>
      </aside>
    </div>
  );
}
