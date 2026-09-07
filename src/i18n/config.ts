/**
 * i18n shared contract (OpenSpec `add-multilanguage-i18n`).
 *
 * Supported locales and the worker UI locale resolution chain live here and
 * nowhere else. Adding a language = add its catalog in `src/locales/` + a new
 * entry in SUPPORTED_LOCALES (no logic changes).
 */
export const SUPPORTED_LOCALES = ['es', 'en', 'ca'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Global fallback locale for the whole system. */
export const FALLBACK_LOCALE: SupportedLocale = 'es';

/** localStorage mirror of the worker's explicit language choice (cold start). */
export const LANGUAGE_STORAGE_KEY = 'openjornada_language';

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/** Normalize a BCP-47 tag or tag list ("es-ES", ["ca-ES","en"]) to a supported locale. */
export function normalizeDetectedLocale(
  value: string | readonly string[] | null | undefined,
): SupportedLocale | null {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  for (const tag of list) {
    const base = tag.toLowerCase().split('-')[0];
    if (isSupportedLocale(base)) return base;
  }
  return null;
}

export interface LocaleResolutionInput {
  /** Worker.language (explicit preference; null/undefined = inherit). */
  workerLanguage?: string | null;
  /** Company.notification_language of the worker's active company. */
  companyLanguage?: string | null;
  /** Browser language tags; only used when one of them is supported. */
  browserLanguages?: readonly string[] | null;
}

/**
 * Worker UI locale chain (contract):
 *   worker.language -> company.notification_language -> browser (if supported) -> "es"
 */
export function resolveWorkerLocale(input: LocaleResolutionInput): SupportedLocale {
  if (isSupportedLocale(input.workerLanguage)) return input.workerLanguage;
  if (isSupportedLocale(input.companyLanguage)) return input.companyLanguage;
  return (
    normalizeDetectedLocale(input.browserLanguages) ?? FALLBACK_LOCALE
  );
}

/** Intl tags used for date/number formatting per supported locale. */
const INTL_TAGS: Record<SupportedLocale, string> = {
  es: 'es-ES',
  en: 'en-GB',
  ca: 'ca-ES',
};

export function toIntlTag(locale: SupportedLocale): string {
  return INTL_TAGS[locale];
}
