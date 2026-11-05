import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr";
import en from "./locales/en";


function getInitialLanguage() {
  const savedLanguage =
    localStorage.getItem("llm-guard-language");

  if (
    savedLanguage === "fr" ||
    savedLanguage === "en"
  ) {
    return savedLanguage;
  }

  const browserLanguage =
    navigator.language?.toLowerCase() || "en";

  return browserLanguage.startsWith("fr")
    ? "fr"
    : "en";
}


i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr,
      en,
    },

    lng: getInitialLanguage(),

    fallbackLng: "en",

    supportedLngs: [
      "fr",
      "en",
    ],

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });


i18n.on(
  "languageChanged",
  (language) => {
    localStorage.setItem(
      "llm-guard-language",
      language
    );

    document.documentElement.lang =
      language;
  }
);


document.documentElement.lang =
  getInitialLanguage();


export default i18n;
