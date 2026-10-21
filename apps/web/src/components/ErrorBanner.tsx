import { useTranslation } from "react-i18next";

export function ErrorBanner({ code, onDismiss }: { code: string | null; onDismiss: () => void }) {
  const { t } = useTranslation();
  if (!code) return null;
  const key = `error.${code}`;
  return <div className="error-banner" role="alert">
    <span>{t(key, { defaultValue: t("error.internal_error") })}</span>
    <button type="button" onClick={onDismiss} aria-label={t("error.dismiss")}>×</button>
  </div>;
}
