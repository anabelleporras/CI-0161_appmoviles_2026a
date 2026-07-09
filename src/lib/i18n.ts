import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { TFunction } from "i18next";

import en from "@/locales/en.json";
import es from "@/locales/es.json";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const NIGHT_PATTERN = /^(.+?)\s*[-—–]\s*(\d+)\s*nights?$/i;
const DAY_PASS_PATTERN = /^(.+?)\s*[-—–]\s*(\d+)\s*day passes?$/i;

export function localizeProductLabel(raw: string, t: TFunction): string {
  const nightMatch = raw.match(NIGHT_PATTERN);
  if (nightMatch) {
    const [, name, count] = nightMatch;
    return t("ticketDetail.nightsLabel", { name, count: Number(count) });
  }

  const dayPassMatch = raw.match(DAY_PASS_PATTERN);
  if (dayPassMatch) {
    const [, name, count] = dayPassMatch;
    return t("ticketDetail.dayPassLabel", { name, count: Number(count) });
  }

  if (__DEV__) {
    console.warn("[localizeProductLabel] unmatched raw label:", JSON.stringify(raw));
  }
  return raw;
}

export const detectDeviceLanguage = (): SupportedLanguage => {
  const deviceLanguage = getLocales()[0]?.languageCode ?? "en";
  return SUPPORTED_LANGUAGES.includes(deviceLanguage as SupportedLanguage)
    ? (deviceLanguage as SupportedLanguage)
    : "en";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
