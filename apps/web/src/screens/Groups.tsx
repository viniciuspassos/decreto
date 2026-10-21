import { useState } from "react";
import { useTranslation } from "react-i18next";
import { voterGroups } from "@decreto/game-content";
import type { GameState } from "@decreto/shared-types";
import { TopBar } from "../components/TopBar.js";
import { formatPercent, signed } from "../components/format.js";

export function Groups({ game, onBack }: { game: GameState; onBack: () => void }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("security-forces");
  const group = game.groups.find((g) => g.id === selected);
  const content = voterGroups.find((g) => g.id === selected);
  const revolutionaries = game.groups.find((g) => g.id === "revolutionaries");

  return (
    <div className="screen">
      <TopBar game={game} title={t("groups.title")} onBack={onBack} />
      <div className="split">
        <section>
          <div className="row"><h2>{t("groups.heading")}</h2><small className="muted">{t("groups.overlap")}</small></div>
          <table>
            <thead>
              <tr>{["group", "size", "support", "semester", "loyalty", "memory"].map((c) => <th key={c}>{t(`groups.col.${c}`)}</th>)}</tr>
            </thead>
            <tbody>
              {game.groups.map((g) => (
                <tr key={g.id} className={g.id === selected ? "on" : ""} onClick={() => setSelected(g.id)}>
                  <td>{t(`group.${g.id}`)}</td>
                  <td>{g.size ? formatPercent(g.size) : "—"}</td>
                  <td><Bar value={g.support} /> {g.support === null ? "—" : formatPercent(g.support)}</td>
                  <td>{g.support === null ? "—" : signed(g.delta)}</td>
                  <td>{g.support === null ? "—" : t(`level.${g.loyalty}`)}</td>
                  <td className="muted">{g.memory ? t(`node.${g.memory}`) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <aside className="col side">
          <small className="eyebrow accent">{t("groups.selected")}</small>
          <h2>{t(`group.${selected}`)}</h2>
          {group && <p className="muted">{t("groups.summary", { size: Math.round(group.size), support: group.support === null ? "—" : Math.round(group.support), loyalty: t(`level.${group.loyalty}`) })}</p>}
          <div className="grid2 panel">
            <small className="eyebrow">{t("groups.likes")}</small>
            <small className="eyebrow">{t("groups.dislikes")}</small>
            <div>{content?.likes.map((id) => <p key={id}>{t(`tree.${id}`)}</p>)}</div>
            <div>{content?.dislikes.map((id) => <p key={id}>{t(`tree.${id}`)}</p>)}</div>
          </div>
          <small className="eyebrow">{t("groups.memory")}</small>
          <p>{group?.memory ? t(`node.${group.memory}`) : "—"}</p>
          <div className="spacer" />
          {revolutionaries && revolutionaries.size > 0 && (
            <div className="panel dashed">{t("groups.alert", { size: Math.round(revolutionaries.size) })}</div>
          )}
        </aside>
      </div>
    </div>
  );
}

export function Bar({ value }: { value: number | null }) {
  return (
    <span className="bar">
      <i style={{ width: `${value ?? 0}%` }} />
    </span>
  );
}
