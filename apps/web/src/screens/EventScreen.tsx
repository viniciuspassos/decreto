import { useTranslation } from "react-i18next";
import type { CountryEvent } from "@decreto/shared-types";
import { semesterOf, yearOf } from "../components/TopBar.js";

export function EventScreen({ event, onContinue }: { event: CountryEvent; onContinue: () => void }) {
  const { t } = useTranslation();
  const layoutClass = event.image ? "event-layout has-image" : "event-layout";

  return <div className="screen event">
    <main className={layoutClass}>
      <section className="event-copy">
        <small className="eyebrow"><span className="tag">{t("event.when", { year: yearOf(event.turn), semester: semesterOf(event.turn) })}</span> {t(event.image ? "event.label" : "event.newsLabel")}</small>
        <h1>{t(`event.${event.id}.title`, { defaultValue: event.id })}</h1>
        <p>{t(`event.${event.id}.body`, { defaultValue: "" })}</p>
        {event.pending && <p className="muted">{t("event.pending")}</p>}
      </section>
      {event.image && <figure className="event-art">
        <img className="event-image" src={`/api/events/${encodeURIComponent(event.id)}/image`} alt={t("event.photo")} />
      </figure>}
      <div className="event-actions">
        <button className="btn primary" onClick={onContinue}>{t("event.continue")}</button>
      </div>
    </main>
  </div>;
}
