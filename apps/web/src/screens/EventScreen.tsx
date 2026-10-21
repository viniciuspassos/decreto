import { useTranslation } from "react-i18next";
import type { CountryEvent } from "@decreto/shared-types";
import { semesterOf, yearOf } from "../components/TopBar.js";

export function EventScreen({ event, onContinue }: { event: CountryEvent; onContinue: () => void }) {
  const { t } = useTranslation();
  return <div className="screen event">
    <aside className="col side">
      <small className="eyebrow"><span className="tag">{t("event.when", { year: yearOf(event.turn), semester: semesterOf(event.turn) })}</span> {t("event.label")}</small>
      <h1>{t(`event.${event.id}.title`, { defaultValue: event.id })}</h1>
      <p>{t(`event.${event.id}.body`, { defaultValue: "" })}</p>
      {event.pending && <p className="muted">{t("event.pending")}</p>}
      <div className="spacer" /><button className="btn primary" onClick={onContinue}>{t("event.continue")}</button>
    </aside>
  </div>;
}
