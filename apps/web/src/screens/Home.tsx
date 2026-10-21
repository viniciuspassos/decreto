import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CreateGameRequest, GameView, InitialSituation } from "@decreto/shared-types";
import { semesterOf, turnInTerm, yearOf } from "../components/TopBar.js";

const SITUATIONS: InitialSituation[] = ["stable", "unstable", "crisis"];
const LANGS = ["pt-BR", "en"] as const;

interface Props {
  save: GameView | null;
  hasSave: boolean;
  pending: boolean;
  onStart: (request: CreateGameRequest) => void;
  onResume: () => void;
}

export function Home({ save, hasSave, pending, onStart, onResume }: Props) {
  const { t, i18n } = useTranslation();
  const [country, setCountry] = useState("República de Vessária");
  const [president, setPresident] = useState("");
  const [situation, setSituation] = useState<InitialSituation>("unstable");
  return <main className="home">
    <span className="eyebrow corner">{t("home.version")}</span>
    <div className="langs">{LANGS.map((lang) => <button key={lang} className={i18n.language === lang ? "on" : ""}
      onClick={() => void i18n.changeLanguage(lang)}>{lang.toUpperCase()}</button>)}</div>
    <h1>Decreto</h1><p className="tagline">{t("home.tagline")}</p>
    <div className="home-cards">
      {hasSave && <section className="panel">
        <small className="eyebrow accent">{t("home.continue")}</small>
        {save && <><h2>{save.country}</h2><p className="muted">{t("home.pres", { name: save.president })}</p>
          <dl className="grid2"><dt>{t("home.year")}</dt><dd>{t("home.yearOf", { year: yearOf(save.turn) })}</dd>
            <dt>{t("home.term")}</dt><dd>{t("home.termOf", { term: save.term, turn: turnInTerm(save.turn), semester: semesterOf(save.turn) })}</dd>
            <dt>{t("home.approval")}</dt><dd>{save.approval}%</dd></dl></>}
        <button className="btn" disabled={pending} onClick={onResume}>{t("home.continueBtn")}</button>
      </section>}
      <section className="panel"><small className="eyebrow accent">{t("home.new")}</small>
        <label>{t("home.country")}<input value={country} onChange={(event) => setCountry(event.target.value)} /></label>
        <label>{t("home.president")}<input value={president} placeholder={t("home.presidentPlaceholder")}
          onChange={(event) => setPresident(event.target.value)} /></label>
        <p>{t("home.situation")}</p><div className="segmented">{SITUATIONS.map((value) =>
          <button key={value} className={value === situation ? "on" : ""} onClick={() => setSituation(value)}>
            <b>{t(`situation.${value}`)}</b><small>{t(`situation.${value}Hint`)}</small></button>)}</div>
        <p className="muted">{t("home.neutral")}</p>
        <button className="btn primary" disabled={pending || !country.trim() || !president.trim()}
          onClick={() => onStart({ country: country.trim(), president: president.trim(), situation })}>{t("home.start")}</button>
      </section>
    </div>
  </main>;
}
