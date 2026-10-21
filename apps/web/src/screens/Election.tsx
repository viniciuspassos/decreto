import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CampaignPromise, ElectionPreviewResponse } from "@decreto/shared-types";
import { gameApi } from "../api/client.js";
import { errorCode } from "../api/useGame.js";
import { treeOf } from "../api/gameView.js";
import type { PlayableGame } from "../api/gameView.js";
import { ErrorBanner } from "../components/ErrorBanner.js";
import { TopBar } from "../components/TopBar.js";

interface Props {
  game: PlayableGame;
  lost: boolean;
  pending: boolean;
  onVote: (promises: string[]) => void;
}

export function Election({ game, lost, pending, onVote }: Props) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<CampaignPromise[]>([]);
  const [maxPromises, setMaxPromises] = useState(3);
  const [chosenIds, setChosenIds] = useState<string[]>([]);
  const [projection, setProjection] = useState<ElectionPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewPending, setPreviewPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    gameApi.campaign(game.id).then((campaign) => {
      if (!active) return;
      setOptions(campaign.options);
      setMaxPromises(campaign.maxPromises);
      setLoading(false);
    }).catch((cause: unknown) => { if (active) { setError(errorCode(cause)); setLoading(false); } });
    return () => { active = false; };
  }, [game.id]);

  useEffect(() => {
    let active = true;
    setPreviewPending(true);
    gameApi.electionPreview(game.id, chosenIds).then((result) => {
      if (active) { setProjection(result); setPreviewPending(false); }
    }).catch((cause: unknown) => { if (active) { setError(errorCode(cause)); setPreviewPending(false); } });
    return () => { active = false; };
  }, [game.id, chosenIds]);

  function toggle(id: string): void {
    setProjection(null);
    setPreviewPending(true);
    setChosenIds((selected) => selected.includes(id) ? selected.filter((value) => value !== id)
      : selected.length < maxPromises ? [...selected, id] : selected);
  }

  const groups = (ids: string[]) => ids.map((id) => t(`group.${id}`)).join(", ");
  const votes = projection?.votes ?? 0;
  return <div className="screen">
    <TopBar game={game} title={t("election.title", { term: game.term })} />
    <ErrorBanner code={error} onDismiss={() => setError(null)} />
    <div className="split"><section className="page">
      {lost && <div className="panel dashed">{t("election.lost")}</div>}
      <small className="eyebrow accent">{t("election.campaign", { term: game.term + 1 })}</small>
      <h1>{t("election.heading", { max: maxPromises })}</h1><p className="muted">{t("election.hint")}</p>
      <div className="cards">{options.map((promise) =>
        <button key={promise.nodeId} disabled={pending || loading} className={`panel card${chosenIds.includes(promise.nodeId) ? " on" : ""}`}
          onClick={() => toggle(promise.nodeId)}>
          <small className="eyebrow">{t(`field.${treeOf(promise.nodeId)?.field ?? "power"}`)}</small>
          <b>{t(`node.${promise.nodeId}`)}</b><small>▲ {groups(promise.gains) || "—"}</small>
          <small className="muted">▼ {groups(promise.loses) || "—"}</small></button>)}</div>
      <small className="eyebrow">{t("election.previous")}</small>
      {game.promises.length === 0 && <p className="muted">{t("election.noPrevious")}</p>}
      {game.promises.map((promise) => <div key={promise} className="row"><span>{t(`node.${promise}`)}</span>
        <span>{t(game.activeNodes.includes(promise) ? "election.kept" : "election.broken")}</span></div>)}
    </section><aside className="col side">
      <small className="eyebrow">{t("election.projection")}</small>
      <div className="row"><span>{game.president}</span><b className="big">{votes}%</b></div>
      <span className="bar"><i style={{ width: `${votes}%` }} /></span>
      <div className="row muted"><span>{t("election.opposition")}</span><b>{100 - votes}%</b></div>
      {projection?.honeymoon && <div className="panel">{t("election.honeymoon", { margin: votes * 2 - 100 })}</div>}
      <div className="spacer" /><small className="muted">{t("election.ifLose")}</small>
      <button className="btn primary" disabled={pending || loading || previewPending || !projection} onClick={() => onVote(chosenIds)}>
        {t("election.vote", { count: chosenIds.length })}</button>
    </aside></div>
  </div>;
}
