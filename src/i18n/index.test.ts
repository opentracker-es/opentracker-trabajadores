/**
 * Regresión del arranque i18n (i18next v26): en esta versión `addResourceBundle`
 * / `hasResourceBundle` no existen ANTES de `init()`, así que los catálogos deben
 * pasar a `init` vía `resources`. Si el bootstrap vuelve a cargar bundles "a
 * mano" antes de init, `initI18n()` rechaza y la app se pinta sin recursos
 * (t() devuelve la clave, p. ej. "login.title").
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n, { applyLocale, initI18n } from './index';
import { LANGUAGE_STORAGE_KEY } from './config';
import esCatalog from '../locales/es.json';
import enCatalog from '../locales/en.json';

beforeAll(() => {
  // Entorno `node` sin localStorage real: lo simulamos fijando 'es' como
  // elección almacenada para que el test sea determinista (independiente del
  // idioma de `navigator` de la máquina que ejecuta).
  vi.stubGlobal('localStorage', {
    getItem: (key: string) =>
      key === LANGUAGE_STORAGE_KEY ? 'es' : null,
    setItem: () => undefined,
    removeItem: () => undefined,
  });
});

describe('initI18n (bootstrap con resources, i18next v26)', () => {
  it('resuelve y deja los bundles cargados: t() devuelve el texto en español', async () => {
    const instance = await initI18n();
    expect(instance.isInitialized).toBe(true);
    expect(i18n.language).toBe('es');
    expect(i18n.t('login.title')).toBe(esCatalog.login.title);
    expect(i18n.t('login.title')).not.toBe('login.title');
  });

  it('applyLocale carga el bundle del nuevo idioma tras el init', async () => {
    await applyLocale('en');
    expect(i18n.t('login.title')).toBe(enCatalog.login.title);
    await applyLocale('es');
    expect(i18n.t('login.title')).toBe(esCatalog.login.title);
  });
});
