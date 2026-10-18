import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { GameState, InitialSituation } from "@decreto/shared-types";
import { loadSave, newGame } from "../api/mockApi.js";
import { semesterOf, turnInTerm, yearOf } from "../components/TopBar.js";

const SITUATIONS: InitialSituation[] = ["stable", "unstable", "crisis"];
const LANGS = ["pt-BR", "en"] as const;

export function Home({ onStart }: { onStart: (game: GameState) => void }) {
  const { t, i18n } = useTranslation();
  const [country, setCountry] = useState("República de Vessária");
  const [president, setPresident] = useState("");
  const [situation, setSituation] = useState<InitialSituation>("unstable");
  const save = loadSave();

  return (
    <main className="home">
      <span className="eyebrow corner">{t("home.version")}</span>
      <div className="langs">
        {LANGS.map((l) => (
          <button key={l} className={i18n.language === l ? "on" : ""} onClick={() => void i18n.changeLanguage(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <h1>Decreto</h1>
      <p className="tagline">{t("home.tagline")}</p>
      <div className="home-cards">
        <section className="panel">
          <small className="eyebrow accent">{t("home.continue")}</small>
          <h2>{save.country}</h2>
          <p className="muted">{t("home.pres", { name: save.president })}</p>
          <dl className="grid2">
            <dt>{t("home.year")}</dt>
            <dd>{t("home.yearOf", { year: yearOf(save.turn) })}</dd>
            <dt>{t("home.term")}</dt>
            <dd>{t("home.termOf", { term: save.term, turn: turnInTerm(save.turn), semester: semesterOf(save.turn) })}</dd>
            <dt>{t("home.approval")}</dt>
            <dd>{save.approval}%</dd>
          </dl>
          <button className="btn" onClick={() => onStart(save)}>
            {t("home.continueBtn")}
          </button>
        </section>
        <section className="panel">
          <small className="eyebrow accent">{t("home.new")}</small>
          <label>
            {t("home.country")}
            <input value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
          <label>
            {t("home.president")}
            <input value={president} placeholder={t("home.presidentPlaceholder")} onChange={(e) => setPresident(e.target.value)} />
          </label>
          <p>{t("home.situation")}</p>
          <div className="segmented">
            {SITUATIONS.map((s) => (
              <button key={s} className={s === situation ? "on" : ""} onClick={() => setSituation(s)}>
                <b>{t(`situation.${s}`)}</b>
                <small>{t(`situation.${s}Hint`)}</small>
              </button>
            ))}
          </div>
          <p className="muted">{t("home.neutral")}</p>
          <button
            className="btn primary"
            disabled={!country.trim() || !president.trim()}
            onClick={() => onStart(newGame(country.trim(), president.trim(), situation))}
          >
            {t("home.start")}
          </button>
        </section>
      </div>
    </main>
  );
}
