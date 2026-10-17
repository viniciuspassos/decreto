import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "@decreto/shared-types";
import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";

const resources: Record<Locale, { translation: typeof ptBR }> = {
  "pt-BR": { translation: ptBR },
  en: { translation: en },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: "pt-BR",
  fallbackLng: "pt-BR",
  interpolation: { escapeValue: false },
});

export default i18n;
