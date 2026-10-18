import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CampaignPromise, GameState } from "@decreto/shared-types";
import { campaignOptions, projectVotes, treeOf } from "../api/mockApi.js";
import { TopBar } from "../components/TopBar.js";

const MAX_PROMISES = 3;
const HONEYMOON_MARGIN = 20;

interface Props {
  game: GameState;
  lost: boolean;
  onVote: (promises: CampaignPromise[]) => void;
}

export function Election({ game, lost, onVote }: Props) {
  const { t } = useTranslation();
  const [chosenIds, setChosenIds] = useState<string[]>([]);
  const options = campaignOptions(game);
  const chosen = options.filter((p) => chosenIds.includes(p.nodeId));
  const votes = projectVotes(game, chosen);
  const margin = votes - (100 - votes);
  const toggle = (id: string) =>
    setChosenIds(chosenIds.includes(id) ? chosenIds.filter((c) => c !== id) : chosenIds.length < MAX_PROMISES ? [...chosenIds, id] : chosenIds);
  const groups = (ids: string[]) => ids.map((id) => t(`group.${id}`)).join(", ");

  return (
    <div className="screen">
      <TopBar game={game} title={t("election.title", { term: game.term })} />
      <div className="split">
        <section className="page">
          {lost && <div className="panel dashed">{t("election.lost")}</div>}
          <small className="eyebrow accent">{t("election.campaign", { term: game.term + 1 })}</small>
          <h1>{t("election.heading", { max: MAX_PROMISES })}</h1>
          <p className="muted">{t("election.hint")}</p>
          <div className="cards">
            {options.map((p) => (
              <button key={p.nodeId} className={`panel card${chosenIds.includes(p.nodeId) ? " on" : ""}`} onClick={() => toggle(p.nodeId)}>
                <small className="eyebrow">{t(`field.${treeOf(p.nodeId)?.field ?? "power"}`)}</small>
                <b>{t(`node.${p.nodeId}`)}</b>
                <small>▲ {groups(p.gains) || "—"}</small>
                <small className="muted">▼ {groups(p.loses) || "—"}</small>
              </button>
            ))}
          </div>
          <small className="eyebrow">{t("election.previous")}</small>
          {game.promises.length === 0 && <p className="muted">{t("election.noPrevious")}</p>}
          {game.promises.map((p) => (
            <div key={p} className="row"><span>{t(`node.${p}`)}</span><span>{t(game.activeNodes.includes(p) ? "election.kept" : "election.broken")}</span></div>
          ))}
        </section>
        <aside className="col side">
          <small className="eyebrow">{t("election.projection")}</small>
          <div className="row"><span>{game.president}</span><b className="big">{votes}%</b></div>
          <span className="bar"><i style={{ width: `${votes}%` }} /></span>
          <div className="row muted"><span>{t("election.opposition")}</span><b>{100 - votes}%</b></div>
          {margin >= HONEYMOON_MARGIN && <div className="panel">{t("election.honeymoon", { margin })}</div>}
          <div className="spacer" />
          <small className="muted">{t("election.ifLose")}</small>
          <button className="btn primary" onClick={() => onVote(chosen)}>{t("election.vote", { count: chosen.length })}</button>
        </aside>
      </div>
    </div>
  );
}
