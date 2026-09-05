/**
 * API error translation (capability `api-error-codes` contract, task 9.2).
 *
 * User-facing errors come back as `detail: { error_code, message }`; older /
 * non-migrated endpoints return `detail` as a plain string; FastAPI 422 schema
 * validation returns a `detail` list. This module resolves a localized message
 * for the active UI locale with the contract fallback chain:
 *
 *   catalog[`errors.<error_code>`]  (per-key fallback to `es` via i18next)
 *     -> server `detail.message`
 *     -> plain-string `detail` (non-migrated endpoints, shown as-is)
 *     -> status-based generic message (`errors.http.*`)
 *     -> generic network message (`errors.network.*`)
 *
 * The `errors.*` keys mirror openjornada-api/docs/error-codes.md and stay in
 * sync with the admin's catalog. Works outside React (uses the i18next global
 * instance, same as `utils/dateFormatters`).
 */
import i18n from '../i18n';

export interface ErrorDetailObject {
  error_code?: unknown;
  message?: unknown;
}

export type ApiErrorDetail =
  | string
  | ErrorDetailObject
  | Array<{ msg?: unknown }>
  | undefined;

interface ErrorBody {
  detail?: ApiErrorDetail;
}

interface HttpError {
  response?: { status?: number; data?: ErrorBody };
}

function asHttpError(error: unknown): HttpError | null {
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    return error as HttpError;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    return error as HttpError;
  }
  return null;
}

/** Extract the raw `detail` payload from an API error (axios or plain fetch shape). */
export function extractErrorDetail(error: unknown): ApiErrorDetail {
  return asHttpError(error)?.response?.data?.detail;
}

/** Translate a stable `error_code` ("worker.invalid_credentials"); undefined if unknown. */
export function translateErrorCode(errorCode: string): string | undefined {
  const key = `errors.${errorCode}`;
  // `t(..., defaultValue: key)` sin catálogo (p. ej. en tests de node) devuelve
  // la propia clave: la tratamos como "código desconocido".
  const text = i18n.t(key, { defaultValue: key });
  return text === key ? undefined : text;
}

/** Generic localized message for an HTTP status without an error_code. */
export function statusFallbackMessage(status?: number): string {
  const keys: Record<number, string> = {
    400: 'errors.http.bad_request',
    401: 'errors.http.unauthorized',
    403: 'errors.http.forbidden',
    404: 'errors.http.not_found',
    409: 'errors.http.conflict',
    410: 'errors.http.not_found',
    422: 'errors.http.bad_request',
    429: 'errors.auth.rate_limited',
    500: 'errors.http.server_error',
  };
  return i18n.t(
    (status !== undefined && keys[status]) || 'errors.network.unexpected',
  );
}

/**
 * User-facing localized message for any API error. `detail` may be an
 * `{ error_code, message }` object, a legacy plain string, or a 422 list.
 */
export function getApiErrorMessage(error: unknown): string {
  const http = asHttpError(error);
  const detail = http?.response?.data?.detail;

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const { error_code: code, message } = detail;
    if (typeof code === 'string' && code) {
      const translated = translateErrorCode(code);
      if (translated) return translated;
    }
    if (typeof message === 'string' && message) return message;
  } else if (typeof detail === 'string' && detail) {
    // Non-migrated endpoint: show the server text as-is (back-compat).
    return detail;
  } else if (Array.isArray(detail) && detail.length > 0) {
    // FastAPI 422 validation errors: join the individual messages.
    const joined = detail
      .map((entry) =>
        entry && typeof entry.msg === 'string' ? entry.msg : undefined,
      )
      .filter(Boolean)
      .join('; ');
    if (joined) return joined;
  }

  if (http?.response?.status !== undefined) {
    return statusFallbackMessage(http.response.status);
  }
  // No response at all: network/CORS failure (offline is handled by the PWA shell).
  return i18n.t('errors.network.generic');
}
