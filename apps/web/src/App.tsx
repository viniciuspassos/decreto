import { useTranslation } from "react-i18next";

export function App() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>Decreto</h1>
      <p>{t("home.tagline")}</p>
    </main>
  );
}
