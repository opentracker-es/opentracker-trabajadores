import React from "react";
import { activeLocale } from "../i18n";
import { applySessionChoice } from "../i18n/language";
import { isSessionLanguageLocked } from "../i18n/sessionLanguage";
import LanguageSelector, {
  AUTO_CHOICE,
  type LanguageChoice,
} from "./LanguageSelector";

/**
 * In-app quick language switch for authenticated screens. Same compact UI as
 * the pre-auth selector but with session-lock semantics (no API, no
 * password): an explicit pick survives `applyProfileLanguage` re-runs and
 * refreshes until "Automatic" (clears lock + hint, re-applies the chain) or
 * logout (clears the lock only).
 */
const InAppLanguageSelector: React.FC = () => {
  const handlePick = async (value: LanguageChoice) => {
    await applySessionChoice(value === AUTO_CHOICE ? null : value);
  };

  const initial: LanguageChoice = isSessionLanguageLocked()
    ? activeLocale()
    : AUTO_CHOICE;

  return <LanguageSelector initial={initial} onPick={handlePick} />;
};

export default InAppLanguageSelector;
