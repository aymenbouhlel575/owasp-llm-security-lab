import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";


export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLanguage =
    i18n.resolvedLanguage?.startsWith("fr")
      ? "fr"
      : "en";


  async function changeLanguage(language) {
    await i18n.changeLanguage(language);
  }


  return (
    <div
      className="language-switcher"
      aria-label={t("language.changeLanguage")}
    >
      <Languages size={16} />

      <button
        type="button"
        className={
          currentLanguage === "fr"
            ? "language-active"
            : ""
        }
        onClick={() => changeLanguage("fr")}
        aria-pressed={currentLanguage === "fr"}
      >
        FR
      </button>

      <span>/</span>

      <button
        type="button"
        className={
          currentLanguage === "en"
            ? "language-active"
            : ""
        }
        onClick={() => changeLanguage("en")}
        aria-pressed={currentLanguage === "en"}
      >
        EN
      </button>
    </div>
  );
}
