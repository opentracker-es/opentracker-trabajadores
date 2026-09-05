/**
 * Worker UI-language lifecycle (tasks 8.2 / 8.4):
 *
 *  - cold start: `initI18n` resolves from localStorage mirror -> browser -> es;
 *  - after login/profile: `applyProfileLanguage` runs the contract chain
 *    worker.language -> company.notification_language -> browser (if supported) -> es;
 *  - explicit user choice: persisted via `PATCH /api/workers/language` (password
 *    re-auth, same pattern as change-password) and mirrored to localStorage;
 *    "Automatic" clears the preference (language = null) and re-runs the chain;
 *  - in-app quick switch (`applySessionChoice`): no API; locks the language for
 *    the session (see `sessionLanguage.ts`) until "Automatic" or logout.
 */
import {
  isSupportedLocale,
  normalizeDetectedLocale,
  resolveWorkerLocale,
  type SupportedLocale,
} from './config';
import {
  applyLocale,
  activeLocale,
  forgetStoredLocale,
  rememberLocale,
} from './index';
import {
  isSessionLanguageLocked,
  lockSessionLanguage,
  unlockSessionLanguage,
} from './sessionLanguage';

export interface WorkerLocaleProfile {
  language?: string | null;
  notification_language?: string | null;
}

let workerLanguagePref: SupportedLocale | null = null;

/** Last profile the chain ran with; lets "Automatic" re-run it without a refetch. */
let lastProfile: WorkerLocaleProfile | null = null;

export function getWorkerLanguagePref(): SupportedLocale | null {
  return workerLanguagePref;
}

function browserLanguages(): readonly string[] {
  return typeof navigator !== 'undefined' ? navigator.languages : [];
}

/**
 * Apply the resolution chain once profile data (`POST /api/workers/me`) exists.
 * The explicit worker preference (if any) is mirrored to localStorage so the
 * next cold start renders in the same language before the profile returns.
 * While the session language is locked (active in-app pick), the preference
 * and the device hint are still updated but the active locale is NOT touched.
 */
export async function applyProfileLanguage(
  profile: WorkerLocaleProfile,
): Promise<SupportedLocale> {
  lastProfile = profile;
  workerLanguagePref = isSupportedLocale(profile.language)
    ? profile.language
    : null;

  if (workerLanguagePref) {
    rememberLocale(workerLanguagePref);
  } else {
    forgetStoredLocale();
  }

  if (isSessionLanguageLocked()) {
    return activeLocale();
  }

  const locale = resolveWorkerLocale({
    workerLanguage: profile.language,
    companyLanguage: profile.notification_language,
    browserLanguages: browserLanguages(),
  });

  await applyLocale(locale);
  return locale;
}

/**
 * Persist an explicit language choice ("Automatic" = null resets the
 * preference) and re-apply the chain with the new state. Called by Settings
 * after a successful `PATCH /api/workers/language`, so the choice is also an
 * explicit user action: locks the session (it) or unlocks it (null).
 */
export async function applyExplicitChoice(
  choice: SupportedLocale | null,
  profile: WorkerLocaleProfile,
): Promise<SupportedLocale> {
  workerLanguagePref = choice;
  lastProfile = {
    language: choice,
    notification_language: profile.notification_language,
  };

  const locale = resolveWorkerLocale({
    workerLanguage: choice ?? null,
    companyLanguage: profile.notification_language,
    browserLanguages: browserLanguages(),
  });

  if (choice) {
    rememberLocale(choice);
    lockSessionLanguage();
  } else {
    forgetStoredLocale();
    unlockSessionLanguage();
  }

  await applyLocale(locale);
  return locale;
}

/**
 * In-app quick switch (no API, no password): a locale applies immediately,
 * mirrors to the device hint and locks the session so profile re-fetches
 * don't revert it. `null` ("Automatic") removes the lock and re-applies the
 * contract chain with the last known profile (hint included).
 */
export async function applySessionChoice(
  choice: SupportedLocale | null,
): Promise<SupportedLocale> {
  if (choice) {
    lockSessionLanguage();
    rememberLocale(choice);
    await applyLocale(choice);
    return choice;
  }

  unlockSessionLanguage();
  return applyProfileLanguage(lastProfile ?? {});
}

/** Locale detected from the browser, or null when the browser has no supported language. */
export function detectBrowserLocale(): SupportedLocale | null {
  return normalizeDetectedLocale(browserLanguages());
}
