import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { GameState } from "@decreto/shared-types";
import { TURNS_PER_TERM } from "../api/mockApi.js";

export const turnInTerm = (turn: number) => ((turn - 1) % TURNS_PER_TERM) + 1;
export const yearOf = (turn: number) => Math.ceil(turn / 2);
export const semesterOf = (turn: number) => (turn % 2 === 1 ? 1 : 2);

interface Props {
  game: GameState;
  title?: string;
  onBack?: () => void;
  children?: ReactNode;
}

export function TopBar({ game, title, onBack, children }: Props) {
  const { t } = useTranslation();
  const step = turnInTerm(game.turn);
  return (
    <header className="topbar">
      <span className="logo">Decreto</span>
      <div className="sep">
        <strong>{game.country}</strong>
        <small>{t("top.president", { name: game.president, term: game.term })}</small>
      </div>
      <div className="sep">
        <small className="eyebrow">
          {t("top.turn", { year: yearOf(game.turn), semester: semesterOf(game.turn), turn: step, total: TURNS_PER_TERM })}
        </small>
        <div className="ticks">
          {Array.from({ length: TURNS_PER_TERM }, (_, i) => (
            <i key={i} className={i < step ? "on" : ""} />
          ))}
        </div>
      </div>
      {title && <span className="sep title">{title}</span>}
      <div className="spacer" />
      <Stat label={t("top.approval")} value={`${game.approval}%`} />
      <Stat label={t("top.capital")} value={String(game.capital)} />
      {children}
      {onBack && (
        <button className="btn" onClick={onBack}>
          ← {t("top.back")}
        </button>
      )}
    </header>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <small className="eyebrow">{label}</small>
      <b>{value}</b>
    </div>
  );
}
