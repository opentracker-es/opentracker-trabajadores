/**
 * Session language lock: marker set when a worker actively picks a locale
 * inside the authenticated app (in-app quick selector or explicit save in
 * Settings). While locked, `applyProfileLanguage` updates the server-pref
 * mirror (and the device localStorage hint) but does NOT override the active
 * locale, so the pick survives profile re-fetches, refreshes and navigation.
 *
 * Lives in sessionStorage: survives reloads within the tab, disappears on a
 * fresh browser session (cold-start chain semantics restored). Logout clears
 * the lock only; the device hint may stay, matching cold start.
 */
export const LANGUAGE_LOCK_STORAGE_KEY = 'openjornada_language_locked';

function sessionStore(): Storage | null {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage;
}

export function lockSessionLanguage(): void {
  sessionStore()?.setItem(LANGUAGE_LOCK_STORAGE_KEY, '1');
}

export function unlockSessionLanguage(): void {
  sessionStore()?.removeItem(LANGUAGE_LOCK_STORAGE_KEY);
}

export function isSessionLanguageLocked(): boolean {
  return sessionStore()?.getItem(LANGUAGE_LOCK_STORAGE_KEY) !== null;
}
