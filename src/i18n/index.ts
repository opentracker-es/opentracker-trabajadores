/**
 * i18next bootstrap for the worker PWA.
 *
 * Locale catalogs (`src/locales/{es,en,ca}.json`) are LAZILY loaded per locale
 * via dynamic import: at boot we only parse the fallback `es` bundle plus the
 * initially-resolved locale (task 8.1), never the three at once. Each locale
 * becomes its own JS chunk, which vite-plugin-pwa precaches automatically
 * (its workbox globPatterns cover all built .js files), so the active catalog
 * works offline (task 9.1).
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  FALLBACK_LOCALE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  normalizeDetectedLocale,
  type SupportedLocale,
} from './config';

/** i18next v26 only exposes add/hasResourceBundle after `init()` has run. */
let initialized = false;

async function importLocaleBundle(
  locale: SupportedLocale,
): Promise<Record<string, unknown>> {
  const mod: { default: Record<string, unknown> } = await import(
    `../locales/${locale}.json`
  );
  return mod.default;
}

/**
 * Load (once) the translation bundle for a locale into i18next. Used by
 * `applyLocale` for lazy locale switching AFTER init; a no-op before it
 * (bundles go through `initI18n`'s `resources` option instead), so calling it
 * early can no longer crash the bootstrap.
 */
export async function loadLocaleBundle(locale: SupportedLocale): Promise<void> {
  if (!initialized || i18n.hasResourceBundle(locale, 'translation')) return;
  const resources = await importLocaleBundle(locale);
  i18n.addResourceBundle(locale, 'translation', resources, true, true);
}

/** Explicit choice persisted on this device (cold-start before profile). */
export function getStoredLocale(): SupportedLocale | null {
  return isSupportedLocale(localStorage.getItem(LANGUAGE_STORAGE_KEY))
    ? (localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLocale)
    : null;
}

export function rememberLocale(locale: SupportedLocale): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
}

export function forgetStoredLocale(): void {
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
}

/** Locale to render with before any profile data exists: stored -> browser -> es. */
function resolveInitialLocale(detector: LanguageDetector): SupportedLocale {
  const stored = getStoredLocale();
  if (stored) return stored;
  return normalizeDetectedLocale(detector.detect()) ?? FALLBACK_LOCALE;
}

/**
 * Initialize i18next (awaited from main.tsx before ReactDOM.render so the
 * first paint already uses the right language). Must run before initReactI18next.
 */
export async function initI18n(): Promise<typeof i18n> {
  const detector = new LanguageDetector();
  const initial = resolveInitialLocale(detector);

  // i18next v26 has no resource store before init(), so the boot bundles must
  // be dynamic-imported here and handed to `init` via `resources` (each locale
  // stays its own lazy chunk).
  const resources: Record<string, { translation: Record<string, unknown> }> = {
    [FALLBACK_LOCALE]: {
      translation: await importLocaleBundle(FALLBACK_LOCALE),
    },
  };
  if (initial !== FALLBACK_LOCALE) {
    resources[initial] = { translation: await importLocaleBundle(initial) };
  }

  await i18n
    .use(detector)
    .use(initReactI18next)
    .init({
      lng: initial,
      fallbackLng: FALLBACK_LOCALE,
      supportedLngs: [...SUPPORTED_LOCALES],
      // es is always loaded as fallback, so missing keys resolve per-key (spec).
      resources,
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage'],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: [],
      },
    });

  initialized = true;
  return i18n;
}

/** Switch the whole UI to `locale`, loading its bundle on demand. */
export async function applyLocale(locale: SupportedLocale): Promise<void> {
  await loadLocaleBundle(locale);
  await i18n.changeLanguage(locale);
}

/** Active locale normalized to a supported code (for Intl/date formatting). */
export function activeLocale(): SupportedLocale {
  return isSupportedLocale(i18n.language) ? i18n.language : FALLBACK_LOCALE;
}

export default i18n;
