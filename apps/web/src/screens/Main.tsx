import { useState } from "react";
import { useTranslation } from "react-i18next";
import { nodeFigures, voterGroups } from "@decreto/game-content";
import type { PlayableGame } from "../api/gameView.js";
import { depthOf, nodeCost, nodeStatus, queueCost, treeOf } from "../api/gameView.js";
import { RadialMap, figureShortName } from "../components/RadialMap.js";
import { Stat, TopBar } from "../components/TopBar.js";
import { INDICATORS, formatIndicator } from "../components/format.js";

interface Props {
  game: PlayableGame;
  onToggleQueue: (nodeId: string) => void;
  pending: boolean;
  onEndSemester: () => void;
  onOpen: (screen: "groups" | "regimes") => void;
}

export function Main({ game, pending, onToggleQueue, onEndSemester, onOpen }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [allIndicators, setAllIndicators] = useState(false);

  return (
    <div className="screen main-screen">
      <TopBar game={game}>
        <Stat label={t("top.actions")} value={`${game.queue.length}/${game.maxActions}`} />
        <button className="btn" onClick={() => onOpen("groups")}>{t("top.groups")}</button>
        <button className="btn" onClick={() => onOpen("regimes")}>{t("top.regimes")}</button>
      </TopBar>
      <div className="main-grid">
        <aside className="col">
          <small className="eyebrow">{t("main.indicators")}</small>
          {INDICATORS.slice(0, allIndicators ? 10 : 5).map((id) => (
            <div key={id} className="row">
              <span>{t(`indicator.${id}`)}</span>
              <b>{formatIndicator(id, game.indicators[id])}</b>
            </div>
          ))}
          <button className="link" onClick={() => setAllIndicators(!allIndicators)}>
            {t(allIndicators ? "main.lessIndicators" : "main.moreIndicators")}
          </button>
          <small className="eyebrow">{t("main.actors")}</small>
          <div className="row"><span>{t("actor.media")}</span><span>{t(`mood.${game.actors.media}`)}</span></div>
          <div className="row"><span>{t("actor.military")}</span><span>{t(`mood.${game.actors.military}`)}</span></div>
          <div className="legend">
            {(["active", "available", "queued", "blocked"] as const).map((s) => (
              <span key={s} className={`node ${s}`}><svg width="14" height="14"><circle cx="7" cy="7" r={s === "blocked" ? 3 : 6} /></svg>{t(`status.${s}`)}</span>
            ))}
            <small className="muted">{t("main.legendFigure")}</small>
          </div>
        </aside>
        <RadialMap game={game} selected={selected} onSelect={setSelected} />
        <aside className="col side">
          {selected ? <NodePanel game={game} nodeId={selected} pending={pending} onToggleQueue={onToggleQueue} /> : <p className="muted">{t("main.pick")}</p>}
          <div className="spacer" />
          <div className="row"><b>{t("main.queueTitle")}</b><span>{t("main.queueCount", { n: game.queue.length, max: game.maxActions })}</span></div>
          {game.queue.map((n) => (
            <button key={n} className="queued-item" disabled={pending} onClick={() => onToggleQueue(n)}>
              <span>{t(`node.${n}`)}</span><span>{nodeCost(game, n)}</span>
            </button>
          ))}
          <div className="row muted"><span>{game.capital} – {queueCost(game)}</span><b>{t("main.remaining", { n: game.capital - queueCost(game) })}</b></div>
          <button className="btn" disabled={pending || Boolean(game.preview?.errors.length)} onClick={onEndSemester}>{t("main.endSemester")} →</button>
        </aside>
      </div>
    </div>
  );
}

function NodePanel({ game, nodeId, pending, onToggleQueue }: { game: PlayableGame; nodeId: string; pending: boolean; onToggleQueue: (id: string) => void }) {
  const { t } = useTranslation();
  const tree = treeOf(nodeId);
  if (!tree) return null;
  const status = nodeStatus(game, nodeId);
  const figure = nodeFigures[nodeId];
  const effects = voterGroups.flatMap((group) => groupEffect(group, tree.id));
  return (
    <>
      <small className="eyebrow accent">
        {t(`field.${tree.field}`)} · {t(`tree.${tree.id}`)} · {t("main.nodeOf", { d: depthOf(nodeId), n: tree.nodes.length })}
      </small>
      <h2>{t(`node.${nodeId}`)}</h2>
      <p className="muted">{t(tree.intensity ? "main.intensity" : "main.toggle")} · {t(`status.${status}`)}</p>
      <div className="panel cost">
        <div><small className="eyebrow">{t("main.cost")}</small><small className="muted">{t("main.formula")}</small></div>
        <b>{nodeCost(game, nodeId)}</b>
      </div>
      <small className="eyebrow">{t("main.effects")}</small>
      {effects.map((e) => (
        <div key={e.id} className="row"><span>{t(`group.${e.id}`)}</span><span>{e.up ? "▲" : "▼"} {t("main.support")}</span></div>
      ))}
      <small className="eyebrow">{t("main.precedents")}</small>
      <div className="panel dashed">
        {status === "active" && figure ? <b>≈ {figureShortName(figure)}</b> : <span className="muted">{t("main.precedentsHidden")}</span>}
      </div>
      {(status === "available" || status === "queued") && (
        <button className="btn primary" disabled={queueActionDisabled(game, nodeId, pending)} onClick={() => onToggleQueue(nodeId)}>
          {status === "queued" ? t("main.unqueue") : t("main.queue", { cost: nodeCost(game, nodeId) })}
        </button>
      )}
    </>
  );
}

function groupEffect(group: (typeof voterGroups)[number], treeId: string): { id: string; up: boolean }[] {
  if (group.likes.includes(treeId)) return [{ id: group.id, up: true }];
  if (group.dislikes.includes(treeId)) return [{ id: group.id, up: false }];
  return [];
}

function queueActionDisabled(game: PlayableGame, nodeId: string, pending: boolean): boolean {
  if (pending) return true;
  if (nodeStatus(game, nodeId) === "queued") return false;
  return nodeCost(game, nodeId) === null || game.queue.length >= game.maxActions;
}
