/**
 * Semántica del bloqueo de idioma de sesión (`sessionLanguage.ts` +
 * `applyProfileLanguage` / `applySessionChoice` / `applyExplicitChoice`):
 * un cambio rápido in-app no lo puede revertir la cadena del perfil,
 * "Automático" lo levanta y logout solo borra el bloqueo (no el hint local).
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { initI18n } from './index';
import { LANGUAGE_STORAGE_KEY } from './config';
import {
  applyExplicitChoice,
  applyProfileLanguage,
  applySessionChoice,
} from './language';
import {
  LANGUAGE_LOCK_STORAGE_KEY,
  isSessionLanguageLocked,
  lockSessionLanguage,
  unlockSessionLanguage,
} from './sessionLanguage';

type StorageStub = ReturnType<typeof createStorageStub>;

function createStorageStub(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

let local: StorageStub;
let session: StorageStub;

function stubStores() {
  local = createStorageStub();
  session = createStorageStub();
  vi.stubGlobal('localStorage', local);
  vi.stubGlobal('sessionStorage', session);
}

beforeAll(async () => {
  // Entorno `node`: sin localStorage/sessionStorage reales. Navegador en
  // español para que la cadena (trabajador -> empresa -> navegador -> es)
  // sea determinista.
  stubStores();
  vi.stubGlobal('navigator', { languages: ['es-ES'] });
  await initI18n();
});

beforeEach(() => {
  stubStores();
});

describe('applyProfileLanguage (sin bloqueo)', () => {
  it('aplica la cadena y espeja la preferencia del worker en el hint local', async () => {
    const locale = await applyProfileLanguage({
      language: 'ca',
      notification_language: 'en',
    });
    expect(locale).toBe('ca');
    expect(i18n.language).toBe('ca');
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBe('ca');
  });

  it('sin preferencia hereda de la empresa y limpia el hint local', async () => {
    const locale = await applyProfileLanguage({
      language: null,
      notification_language: 'en',
    });
    expect(locale).toBe('en');
    expect(i18n.language).toBe('en');
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });
});

describe('applyProfileLanguage con bloqueo de sesión', () => {
  it('no toca el idioma activo pero sí actualiza el hint local', async () => {
    await applySessionChoice('en');
    const locale = await applyProfileLanguage({
      language: 'ca',
      notification_language: 'es',
    });
    expect(locale).toBe('en');
    expect(i18n.language).toBe('en');
    // El hint del dispositivo sigue reflejando la preferencia del servidor
    // (semántica de cold start en una pestaña nueva, sin sessionStorage).
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBe('ca');
  });
});

describe('applySessionChoice (selector in-app)', () => {
  it('fija idioma + hint local + bloqueo', async () => {
    const locale = await applySessionChoice('en');
    expect(locale).toBe('en');
    expect(i18n.language).toBe('en');
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(session.getItem(LANGUAGE_LOCK_STORAGE_KEY)).not.toBeNull();
    expect(isSessionLanguageLocked()).toBe(true);
  });

  it('"Automático" quita bloqueo + hint y re-aplica la cadena con el último perfil', async () => {
    await applyProfileLanguage({ language: 'ca', notification_language: 'es' });
    await applySessionChoice('en');
    const locale = await applySessionChoice(null);
    expect(isSessionLanguageLocked()).toBe(false);
    expect(locale).toBe('ca');
    expect(i18n.language).toBe('ca');
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBe('ca');
  });
});

describe('applyExplicitChoice (guardado con contraseña en Ajustes)', () => {
  it('un idioma explícito guarda también bloquea la sesión', async () => {
    const locale = await applyExplicitChoice('en', {
      language: 'ca',
      notification_language: 'es',
    });
    expect(locale).toBe('en');
    expect(isSessionLanguageLocked()).toBe(true);
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('"Automático" quita bloqueo + hint y re-aplica la cadena', async () => {
    lockSessionLanguage();
    local.setItem(LANGUAGE_STORAGE_KEY, 'en');
    const locale = await applyExplicitChoice(null, {
      language: 'en',
      notification_language: 'ca',
    });
    expect(isSessionLanguageLocked()).toBe(false);
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
    expect(locale).toBe('ca');
    expect(i18n.language).toBe('ca');
  });
});

describe('logout', () => {
  it('solo borra el bloqueo; el hint local sobrevive (semántica de cold start)', async () => {
    await applySessionChoice('en');
    unlockSessionLanguage();
    expect(isSessionLanguageLocked()).toBe(false);
    expect(local.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});
