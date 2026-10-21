import { useTranslation } from "react-i18next";
import type { RiskId, SemesterReport } from "@decreto/shared-types";
import type { PlayableGame } from "../api/gameView.js";
import { TURNS_PER_TERM } from "@decreto/game-content";
import { TopBar, turnInTerm } from "../components/TopBar.js";
import { INDICATORS, formatIndicator, signed } from "../components/format.js";
import { Bar } from "./Groups.js";

const RISKS: RiskId[] = ["coup", "attack", "revolution", "rebels"];
const riskLevel = (v: number) => (v === 0 ? "none" : v < 30 ? "low" : v < 60 ? "medium" : "high");

export function Summary({ game, report, onContinue }: { game: PlayableGame; report: SemesterReport; onContinue: () => void }) {
  const { t } = useTranslation();
  const change = game.approval - report.approvalBefore;
  const headline = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const toElection = TURNS_PER_TERM - turnInTerm(game.turn) + 1;

  return (
    <div className="screen">
      <TopBar game={game} title={t("summary.title")} />
      <div className="page">
        <div className="row">
          <div>
            <small className="eyebrow accent">{t("summary.closed")}</small>
            <h1>{t(`summary.headline.${headline}`)}</h1>
            <p className="muted">
              {t("summary.applied", { count: report.applied.length })} {report.applied.map((n) => `· ${t(`node.${n}`)}`).join(" ")}
            </p>
          </div>
          <div className="big-stats">
            <span>{report.approvalBefore} → {game.approval}%</span>
            <span>{report.capitalBefore} → {game.capital}</span>
          </div>
        </div>
        <div className="cols3">
          <section className="panel">
            <small className="eyebrow">{t("main.indicators")}</small>
            {INDICATORS.map((id) => (
              <div key={id} className="row">
                <span>{t(`indicator.${id}`)}</span>
                <span><span className="muted">{formatIndicator(id, report.indicatorsBefore[id])} →</span> <b>{formatIndicator(id, game.indicators[id])}</b></span>
              </div>
            ))}
          </section>
          <section className="panel">
            <small className="eyebrow">{t("summary.groups")}</small>
            {report.groupChanges.length === 0 && <p className="muted">{t("summary.noGroups")}</p>}
            {report.groupChanges.map((g) => (
              <div key={g.id} className="row"><span>{t(`group.${g.id}`)}</span><b>{signed(g.delta)}</b></div>
            ))}
          </section>
          <section className="panel">
            <small className="eyebrow">{t("summary.reactions")}</small>
            <div className="row"><span>{t("actor.media")}</span><span>{t(`mood.${game.actors.media}`)}</span></div>
            <div className="row"><span>{t("actor.military")}</span><span>{t(`mood.${game.actors.military}`)}</span></div>
            <small className="eyebrow">{t("summary.risks")}</small>
            {RISKS.map((r) => (
              <div key={r}>
                <div className="row"><span>{t(`risk.${r}`)}</span><span>{t(`riskLevel.${riskLevel(report.risks[r])}`)}</span></div>
                <Bar value={report.risks[r]} />
              </div>
            ))}
          </section>
        </div>
        {report.events.length > 0 && <section className="panel">
          <small className="eyebrow">{t("event.label")}</small>
          {report.events.map((event, index) => <p key={`${event.id}-${index}`}>{t(`event.${event.id}.title`, { defaultValue: event.id })}</p>)}
        </section>}
        <div className="row footer">
          <span className="muted">{t("summary.toElection", { count: toElection })}</span>
          <button className="btn primary" onClick={onContinue}>{t("summary.next")} →</button>
        </div>
      </div>
    </div>
  );
}
