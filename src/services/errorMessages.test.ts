import { beforeAll, describe, expect, it } from 'vitest';
import i18n from '../i18n';
import {
  getApiErrorMessage,
  translateErrorCode,
} from './errorMessages';
import es from '../locales/es.json';
import en from '../locales/en.json';
import ca from '../locales/ca.json';

beforeAll(async () => {
  await i18n.init({
    lng: 'es',
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'ca'],
    resources: {
      es: { translation: es },
      en: { translation: en },
      ca: { translation: ca },
    },
    interpolation: { escapeValue: false },
  });
});

const axiosLike = (status: number, detail: unknown) => ({
  isAxiosError: true,
  response: { status, data: { detail } },
});

describe('translateErrorCode (registro error-codes.md, dominio worker)', () => {
  it('traduce un código conocido en el idioma activo', () => {
    expect(translateErrorCode('worker.invalid_credentials')).toBe(
      (es.errors as Record<string, Record<string, string>>).worker
        .invalid_credentials,
    );
  });

  it('devuelve undefined para códigos desconocidos', () => {
    expect(translateErrorCode('worker.does_not_exist')).toBeUndefined();
    expect(translateErrorCode('totally.unknown')).toBeUndefined();
  });

  it('traduce en los tres locales y cubre todos los dominios del registro', () => {
    for (const loc of ['es', 'en', 'ca'] as const) {
      void i18n.changeLanguage(loc);
      expect(translateErrorCode('auth.invalid_credentials')).toBeDefined();
      expect(translateErrorCode('absence.validation_failed')).toBeDefined();
      expect(translateErrorCode('change_request.pending_exists')).toBeDefined();
      expect(translateErrorCode('sms.template_exceeds_segment')).toBeDefined();
      expect(translateErrorCode('company.has_workers')).toBeDefined();
      expect(translateErrorCode('settings.invalid_locale')).toBeDefined();
    }
    void i18n.changeLanguage('es');
  });
});

describe('getApiErrorMessage (cadena de reserva del contrato)', () => {
  it('error_code conocido -> mensaje localizado del catálogo', () => {
    expect(
      getApiErrorMessage(
        axiosLike(401, {
          error_code: 'worker.invalid_credentials',
          message: 'Credenciales incorrectas',
        }),
      ),
    ).toBe(
      (es.errors as Record<string, Record<string, string>>).worker
        .invalid_credentials,
    );
  });

  it('error_code desconocido -> detail.message del servidor', () => {
    expect(
      getApiErrorMessage(
        axiosLike(400, {
          error_code: 'worker.future_code',
          message: 'Texto del servidor',
        }),
      ),
    ).toBe('Texto del servidor');
  });

  it('detail string plano (endpoint no migrado) -> se muestra tal cual', () => {
    expect(getApiErrorMessage(axiosLike(400, 'El nombre es obligatorio'))).toBe(
      'El nombre es obligatorio',
    );
  });

  it('sin detail: usa el genérico por status y el genérico de red', () => {
    expect(getApiErrorMessage(axiosLike(500, undefined))).toBe(
      (es.errors as Record<string, Record<string, string>>).http.server_error,
    );
    expect(getApiErrorMessage(new Error('boom'))).toBe(
      (es.errors as Record<string, Record<string, string>>).network.generic,
    );
  });

  it('lista de validación 422 de FastAPI -> une los msg', () => {
    expect(
      getApiErrorMessage(
        axiosLike(422, [{ msg: 'campo obligatorio' }, { msg: 'formato inválido' }]),
      ),
    ).toBe('campo obligatorio; formato inválido');
  });

  it('el mismo código se traduce al locale activo tras changeLanguage', async () => {
    await i18n.changeLanguage('en');
    expect(
      getApiErrorMessage(
        axiosLike(422, { error_code: 'worker.invalid_locale', message: 'x' }),
      ),
    ).toBe(
      (en.errors as Record<string, Record<string, string>>).worker
        .invalid_locale,
    );
    await i18n.changeLanguage('ca');
    expect(
      getApiErrorMessage(
        axiosLike(422, { error_code: 'worker.invalid_locale', message: 'x' }),
      ),
    ).toBe(
      (ca.errors as Record<string, Record<string, string>>).worker
        .invalid_locale,
    );
    await i18n.changeLanguage('es');
  });
});
