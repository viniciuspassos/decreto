import { useTranslation } from "react-i18next";

export function EndedNotice({ onRestart }: { onRestart: () => void }) {
  const { t } = useTranslation();
  return <div className="screen"><div className="page">
    <p>{t("end.ended")}</p>
    <button className="btn primary" onClick={onRestart}>{t("end.restart")}</button>
  </div></div>;
}
