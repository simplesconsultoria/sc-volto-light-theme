import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SHOWCASE_STORAGE_KEY } from './helpers/storage';

// These run in jsdom, so `window` exists and runtime_config takes its client
// branch: it reads `window.env`, the object the server serialises into the
// page, and ignores process.env entirely. That is the path that decides
// whether the showcase loads in a browser, so it is the one exercised here.
// runtime_config snapshots that object at import time, hence the resetModules
// and dynamic import per case.

// Volto's test-setup-globals stubs localStorage with bare vi.fn()s, so setItem
// is a no-op and getItem always returns undefined. Seeding a stored pick needs
// a working implementation.
function useMemoryLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  });
}

function makeConfig() {
  return {
    settings: {
      appExtras: [],
      vlt: {
        components: {
          header: 'vlt',
          navigation: 'vlt',
          mobileNavigation: 'vlt',
          footer: 'vlt',
        },
        display: { accessibilityBar: true },
      },
    },
  } as any;
}

async function applyConfig(
  env: Record<string, string> | undefined,
  config: any,
) {
  vi.resetModules();
  if (env === undefined) {
    delete (window as any).env;
  } else {
    (window as any).env = env;
  }
  const install = (await import('./index')).default;
  install(config);
  return config;
}

const ENABLED = { RAZZLE_VLT_SHOWCASE: '1' };

describe('@simplesconsultoria/showcase', () => {
  beforeEach(() => {
    useMemoryLocalStorage();
  });

  afterEach(() => {
    delete (window as any).env;
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  describe('the env gate', () => {
    it('does not register the showcase when window.env is absent', async () => {
      const config = await applyConfig(undefined, makeConfig());
      expect(config.settings.appExtras).toEqual([]);
    });

    it('does not register the showcase when the variable is unset', async () => {
      const config = await applyConfig({}, makeConfig());
      expect(config.settings.appExtras).toEqual([]);
    });

    it('does not register the showcase when the variable is empty', async () => {
      const config = await applyConfig(
        { RAZZLE_VLT_SHOWCASE: '' },
        makeConfig(),
      );
      expect(config.settings.appExtras).toEqual([]);
    });

    it('registers the showcase when the variable is set', async () => {
      const config = await applyConfig(ENABLED, makeConfig());
      expect(config.settings.appExtras).toHaveLength(1);
      expect(config.settings.appExtras[0].match).toBe('');
      expect(config.settings.appExtras[0].component).toBeTruthy();
    });

    it('preserves appExtras already registered by other add-ons', async () => {
      const config = makeConfig();
      const existing = { match: '/foo', component: () => null };
      config.settings.appExtras = [existing];
      await applyConfig(ENABLED, config);
      expect(config.settings.appExtras).toHaveLength(2);
      expect(config.settings.appExtras[0]).toBe(existing);
    });
  });

  describe('the stored selection', () => {
    it('overrides the theme defaults', async () => {
      window.localStorage.setItem(
        SHOWCASE_STORAGE_KEY,
        JSON.stringify({ navigation: 'sc' }),
      );
      const config = await applyConfig(ENABLED, makeConfig());
      expect(config.settings.vlt.components.navigation).toBe('sc');
      // untouched slots keep their default
      expect(config.settings.vlt.components.footer).toBe('vlt');
    });

    it('is ignored entirely when the showcase is gated off', async () => {
      window.localStorage.setItem(
        SHOWCASE_STORAGE_KEY,
        JSON.stringify({ navigation: 'sc' }),
      );
      const config = await applyConfig({}, makeConfig());
      expect(config.settings.vlt.components.navigation).toBe('vlt');
    });

    it('ignores slots that do not exist', async () => {
      window.localStorage.setItem(
        SHOWCASE_STORAGE_KEY,
        JSON.stringify({ navigation: 'sc', bogusSlot: 'evil' }),
      );
      const config = await applyConfig(ENABLED, makeConfig());
      expect(config.settings.vlt.components.navigation).toBe('sc');
      expect(config.settings.vlt.components).not.toHaveProperty('bogusSlot');
    });

    it('survives malformed stored JSON', async () => {
      window.localStorage.setItem(SHOWCASE_STORAGE_KEY, '{not json');
      const config = await applyConfig(ENABLED, makeConfig());
      expect(config.settings.vlt.components.navigation).toBe('vlt');
      expect(config.settings.appExtras).toHaveLength(1);
    });

    it('does nothing when the theme has installed no vlt settings', async () => {
      window.localStorage.setItem(
        SHOWCASE_STORAGE_KEY,
        JSON.stringify({ navigation: 'sc' }),
      );
      const config = { settings: { appExtras: [] } } as any;
      await applyConfig(ENABLED, config);
      expect(config.settings.appExtras).toHaveLength(1);
    });
  });
});
