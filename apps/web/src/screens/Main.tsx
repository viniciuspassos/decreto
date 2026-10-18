import { useState } from "react";
import { useTranslation } from "react-i18next";
import { nodeFigures, voterGroups } from "@decreto/game-content";
import type { GameState } from "@decreto/shared-types";
import { MAX_ACTIONS, depthOf, nodeCost, nodeStatus, queuedCost, toggleQueued, treeOf } from "../api/mockApi.js";
import { RadialMap, figureShortName } from "../components/RadialMap.js";
import { Stat, TopBar } from "../components/TopBar.js";
import { INDICATORS, formatIndicator } from "../components/format.js";

interface Props {
  game: GameState;
  onChange: (game: GameState) => void;
  onEndSemester: () => void;
  onOpen: (screen: "groups" | "regimes") => void;
}

export function Main({ game, onChange, onEndSemester, onOpen }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [allIndicators, setAllIndicators] = useState(false);

  return (
    <div className="screen">
      <TopBar game={game}>
        <Stat label={t("top.actions")} value={`${game.queue.length}/${MAX_ACTIONS}`} />
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
          {selected ? <NodePanel game={game} nodeId={selected} onChange={onChange} /> : <p className="muted">{t("main.pick")}</p>}
          <div className="spacer" />
          <div className="row"><b>{t("main.queueTitle")}</b><span>{t("main.queueCount", { n: game.queue.length, max: MAX_ACTIONS })}</span></div>
          {game.queue.map((n) => (
            <button key={n} className="queued-item" onClick={() => onChange(toggleQueued(game, n))}>
              <span>{t(`node.${n}`)}</span><span>{nodeCost(n)}</span>
            </button>
          ))}
          <div className="row muted"><span>{game.capital} – {queuedCost(game)}</span><b>{t("main.remaining", { n: game.capital - queuedCost(game) })}</b></div>
          <button className="btn" onClick={onEndSemester}>{t("main.endSemester")} →</button>
        </aside>
      </div>
    </div>
  );
}

function NodePanel({ game, nodeId, onChange }: { game: GameState; nodeId: string; onChange: (g: GameState) => void }) {
  const { t } = useTranslation();
  const tree = treeOf(nodeId);
  if (!tree) return null;
  const status = nodeStatus(game, nodeId);
  const figure = nodeFigures[nodeId];
  const effects = voterGroups.flatMap((g) =>
    g.likes.includes(tree.id) ? [{ id: g.id, up: true }] : g.dislikes.includes(tree.id) ? [{ id: g.id, up: false }] : [],
  );
  return (
    <>
      <small className="eyebrow accent">
        {t(`field.${tree.field}`)} · {t(`tree.${tree.id}`)} · {t("main.nodeOf", { d: depthOf(nodeId), n: tree.nodes.length })}
      </small>
      <h2>{t(`node.${nodeId}`)}</h2>
      <p className="muted">{t(tree.intensity ? "main.intensity" : "main.toggle")} · {t(`status.${status}`)}</p>
      <div className="panel cost">
        <div><small className="eyebrow">{t("main.cost")}</small><small className="muted">{t("main.formula")}</small></div>
        <b>{nodeCost(nodeId)}</b>
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
        <button className="btn primary" onClick={() => onChange(toggleQueued(game, nodeId))}>
          {status === "queued" ? t("main.unqueue") : t("main.queue", { cost: nodeCost(nodeId) })}
        </button>
      )}
    </>
  );
}
