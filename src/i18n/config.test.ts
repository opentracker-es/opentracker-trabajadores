import { describe, expect, it } from 'vitest';
import {
  normalizeDetectedLocale,
  resolveWorkerLocale,
} from './config';

describe('resolveWorkerLocale (cadena de resolución del contrato i18n)', () => {
  it('usar worker.language si está soportado, aunque la empresa diga otra cosa', () => {
    expect(
      resolveWorkerLocale({
        workerLanguage: 'en',
        companyLanguage: 'es',
        browserLanguages: ['ca-ES'],
      }),
    ).toBe('en');
  });

  it('hereda notification_language de la empresa sin preferencia del trabajador', () => {
    expect(
      resolveWorkerLocale({
        workerLanguage: null,
        companyLanguage: 'ca',
        browserLanguages: ['de'],
      }),
    ).toBe('ca');
  });

  it('usa el navegador solo si algún idioma detectado está soportado (con regionalización)', () => {
    expect(
      resolveWorkerLocale({
        workerLanguage: null,
        companyLanguage: null,
        browserLanguages: ['fr-FR', 'en-GB'],
      }),
    ).toBe('en');
  });

  it('si nada está soportado, cae a es', () => {
    expect(
      resolveWorkerLocale({
        workerLanguage: null,
        companyLanguage: 'xx',
        browserLanguages: ['fr-FR'],
      }),
    ).toBe('es');

    expect(resolveWorkerLocale({})).toBe('es');
  });

  it('un valor no soportado en worker.language se ignora (cae a la empresa)', () => {
    expect(
      resolveWorkerLocale({
        workerLanguage: 'de',
        companyLanguage: 'ca',
      }),
    ).toBe('ca');
  });
});

describe('normalizeDetectedLocale', () => {
  it('normaliza tags BCP-47 a los locales soportados', () => {
    expect(normalizeDetectedLocale('es-ES')).toBe('es');
    expect(normalizeDetectedLocale('CA')).toBe('ca');
    expect(normalizeDetectedLocale(['fr', 'en-US'])).toBe('en');
  });

  it('devuelve null para idiomas no soportados o vacíos', () => {
    expect(normalizeDetectedLocale('fr-FR')).toBeNull();
    expect(normalizeDetectedLocale(undefined)).toBeNull();
    expect(normalizeDetectedLocale([])).toBeNull();
  });
});
