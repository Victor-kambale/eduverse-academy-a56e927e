import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./translations/en.json";
import zh from "./translations/zh.json";
import es from "./translations/es.json";
import ru from "./translations/ru.json";
import de from "./translations/de.json";
import it from "./translations/it.json";
import ar from "./translations/ar.json";
import fr from "./translations/fr.json";
import hi from "./translations/hi.json";
import lg from "./translations/lg.json";

export const languages = [
  { code: "zh", name: "中文", flag: "🇨🇳", rtl: false },
  { code: "es", name: "Español", flag: "🇪🇸", rtl: false },
  { code: "en", name: "English", flag: "🇺🇸", rtl: false },
  { code: "fr", name: "Français", flag: "🇫🇷", rtl: false },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", rtl: false },
  { code: "ar", name: "العربية", flag: "🇸🇦", rtl: true },
  { code: "ru", name: "Русский", flag: "🇷🇺", rtl: false },
  { code: "de", name: "Deutsch", flag: "🇩🇪", rtl: false },
  { code: "it", name: "Italiano", flag: "🇮🇹", rtl: false },
  { code: "lg", name: "Oluganda", flag: "🇺🇬", rtl: false },
];

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es },
  ru: { translation: ru },
  de: { translation: de },
  it: { translation: it },
  ar: { translation: ar },
  fr: { translation: fr },
  hi: { translation: hi },
  lg: { translation: lg },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    cleanCode: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

// Handle RTL
const updateDirection = (lng: string) => {
  const normalized = (lng || "en").split("-")[0];
  const lang = languages.find((l) => l.code === normalized);

  document.documentElement.dir = lang?.rtl ? "rtl" : "ltr";
  document.documentElement.lang = normalized;
};

i18n.on("languageChanged", updateDirection);
updateDirection(i18n.resolvedLanguage || i18n.language);

export default i18n;
