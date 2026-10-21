import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CampaignPromise, ElectionPreviewResponse } from "@decreto/shared-types";
import { gameApi } from "../api/client.js";
import { errorCode } from "../api/useGame.js";
import { treeOf, type PlayableGame } from "../api/gameView.js";
import { ErrorBanner } from "../components/ErrorBanner.js";
import { TopBar } from "../components/TopBar.js";

interface Props {
  game: PlayableGame;
  lost: boolean;
  pending: boolean;
  onVote: (promises: string[]) => void;
  campaignOnly: boolean;
  onCampaign: (promises: string[]) => void;
}

export function Election({ game, lost, pending, onVote, campaignOnly, onCampaign }: Props) {
  const { t } = useTranslation();
  const canEditPromises = canEditCampaign(game, campaignOnly);
  const [options, setOptions] = useState<CampaignPromise[]>([]);
  const [maxPromises, setMaxPromises] = useState(3);
  const [chosenIds, setChosenIds] = useState<string[]>(game.campaignPromises ?? []);
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
    if (!canEditPromises) return;
    if (!chosenIds.includes(id) && chosenIds.length >= maxPromises) return;
    setProjection(null);
    setPreviewPending(true);
    setChosenIds((selected) => selected.includes(id) ? selected.filter((value) => value !== id)
      : selected.length < maxPromises ? [...selected, id] : selected);
  }

  const votes = projection?.votes ?? 0;
  return <div className="screen">
    <TopBar game={game} title={t("election.title", { term: game.term })} />
    <ErrorBanner code={error} onDismiss={() => setError(null)} />
    <div className="split"><section className="page">
      {lost && <div className="panel dashed">{t("election.lost")}</div>}
      <small className="eyebrow accent">{t("election.campaign", { term: game.term + 1 })}</small>
      <h1>{t("election.heading", { max: maxPromises })}</h1><p className="muted">{t("election.hint")}</p>
      <PromiseCards options={options} chosenIds={chosenIds} disabled={pending || loading || !canEditPromises} onToggle={toggle} />
      <PreviousPromises game={game} options={options} campaignOnly={campaignOnly} />
    </section><aside className="col side">
      <small className="eyebrow">{t("election.projection")}</small>
      <div className="row"><span>{game.president}</span><b className="big">{votes}%</b></div>
      <span className="bar"><i style={{ width: `${votes}%` }} /></span>
      <div className="row muted"><span>{t("election.opposition")}</span><b>{100 - votes}%</b></div>
      <ElectionControls projection={projection} votes={votes} campaignOnly={campaignOnly} chosenCount={chosenIds.length}
        disabled={pending || loading || previewPending || !projection} onCampaign={() => onCampaign(chosenIds)} onVote={() => onVote(chosenIds)} />
    </aside></div>
  </div>;
}

function PromiseCards({ options, chosenIds, disabled, onToggle }: {
  options: CampaignPromise[];
  chosenIds: string[];
  disabled: boolean;
  onToggle: (nodeId: string) => void;
}) {
  const { t } = useTranslation();
  return <div className="cards">{options.map((promise) => <PromiseCard key={promise.nodeId} promise={promise}
    chosen={chosenIds.includes(promise.nodeId)} disabled={disabled} onClick={() => onToggle(promise.nodeId)} t={t} />)}</div>;
}

function PromiseCard({ promise, chosen, disabled, onClick, t }: {
  promise: CampaignPromise;
  chosen: boolean;
  disabled: boolean;
  onClick: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const field = promise.nodeId;
  return <button disabled={disabled} className={`panel card${chosen ? " on" : ""}`} onClick={onClick}>
    <small className="eyebrow">{t(`field.${policyField(field)}`)}</small>
    <b>{t(`node.${field}`)}</b><small>▲ {translateGroups(promise.gains, t) || "—"}</small>
    <small className="muted">▼ {translateGroups(promise.loses, t) || "—"}</small></button>;
}

function PreviousPromises({ game, options, campaignOnly }: { game: PlayableGame; options: CampaignPromise[]; campaignOnly: boolean }) {
  const { t } = useTranslation();
  const unavailable = game.campaignPromises?.filter((id) => !options.some((option) => option.nodeId === id)) ?? [];
  return <>
    {!campaignOnly && unavailable.map((id) => <div key={id} className="row"><span>{t(`node.${id}`)}</span><span>{t("election.selectedCampaign")}</span></div>)}
    <small className="eyebrow">{t("election.previous")}</small>
    {game.promises.length === 0 && <p className="muted">{t("election.noPrevious")}</p>}
    {game.promises.map((promise) => <div key={promise} className="row"><span>{t(`node.${promise}`)}</span>
      <span>{t(game.activeNodes.includes(promise) ? "election.kept" : "election.broken")}</span></div>)}
  </>;
}

function ElectionControls({ projection, votes, campaignOnly, chosenCount, disabled, onCampaign, onVote }: {
  projection: ElectionPreviewResponse | null;
  votes: number;
  campaignOnly: boolean;
  chosenCount: number;
  disabled: boolean;
  onCampaign: () => void;
  onVote: () => void;
}) {
  const { t } = useTranslation();
  return <>
    {projection?.honeymoon && <div className="panel">{t("election.honeymoon", { margin: votes * 2 - 100 })}</div>}
    <div className="spacer" />
    {!campaignOnly && <small className="muted">{t("election.ifLose")}</small>}
    <button className="btn primary" disabled={disabled} onClick={campaignOnly ? onCampaign : onVote}>
      {t(campaignOnly ? "election.confirmCampaign" : "election.vote", { count: chosenCount })}</button>
  </>;
}

function policyField(nodeId: string): string {
  const tree = treeOf(nodeId);
  return tree?.field ?? "power";
}

function translateGroups(ids: string[], translate: ReturnType<typeof useTranslation>["t"]): string {
  return ids.map((id) => translate(`group.${id}`)).join(", ");
}

function canEditCampaign(game: PlayableGame, campaignOnly: boolean): boolean {
  return campaignOnly || game.campaignPromises === undefined;
}
