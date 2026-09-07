import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLocale } from "../i18n/config";

export const AUTO_CHOICE = "auto";

export type LanguageChoice = SupportedLocale | typeof AUTO_CHOICE;

interface LanguageSelectorProps {
  /** Value shown on mount (effective locale or "auto"). */
  initial: LanguageChoice;
  /** Called on every pick; the component handles the disabled state. */
  onPick: (choice: LanguageChoice) => Promise<void>;
}

/**
 * Compact globe/select language picker shared by the pre-auth screens
 * (`LoginLanguageSelector`, device-local hint) and the authenticated in-app
 * quick switch (`InAppLanguageSelector`, session-locked). UI only: the
 * wrappers own the persistence behavior.
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  initial,
  onPick,
}) => {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<LanguageChoice>(initial);
  const [switching, setSwitching] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LanguageChoice;
    setChoice(value);
    setSwitching(true);
    try {
      await onPick(value);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <svg
        className="w-4 h-4 text-gray-500 absolute left-2 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <select
        value={choice}
        onChange={handleChange}
        disabled={switching}
        aria-label={t("settings.language.title")}
        className="shadow-sm appearance-none bg-white border border-gray-300 rounded-md py-1 pl-7 pr-6 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 disabled:opacity-50"
      >
        <option value={AUTO_CHOICE}>{t("settings.language.auto")}</option>
        <option value="es">{t("settings.language.es")}</option>
        <option value="en">{t("settings.language.en")}</option>
        <option value="ca">{t("settings.language.ca")}</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
