import React from "react";
import {
  applyLocale,
  forgetStoredLocale,
  getStoredLocale,
  rememberLocale,
} from "../i18n";
import { FALLBACK_LOCALE } from "../i18n/config";
import { detectBrowserLocale } from "../i18n/language";
import LanguageSelector, {
  AUTO_CHOICE,
  type LanguageChoice,
} from "./LanguageSelector";

/**
 * Compact language selector for pre-auth screens (login, forgot/reset
 * password). The choice is device-local only: persisted to localStorage and
 * applied immediately via `applyLocale` (lazy bundle load), with NO API call
 * and NO session lock. After login, `applyProfileLanguage` re-runs the
 * contract chain (worker.language -> company -> browser -> es), where this
 * stored choice acts only as the cold-start hint and the profile preference
 * wins.
 */
const LoginLanguageSelector: React.FC = () => {
  const handlePick = async (value: LanguageChoice) => {
    if (value === AUTO_CHOICE) {
      forgetStoredLocale();
      await applyLocale(detectBrowserLocale() ?? FALLBACK_LOCALE);
    } else {
      rememberLocale(value);
      await applyLocale(value);
    }
  };

  return (
    <LanguageSelector
      initial={getStoredLocale() ?? AUTO_CHOICE}
      onPick={handlePick}
    />
  );
};

export default LoginLanguageSelector;
