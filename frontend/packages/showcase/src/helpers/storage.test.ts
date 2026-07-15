import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SHOWCASE_STORAGE_KEY,
  clearStoredComponents,
  readStoredComponents,
  storeComponent,
} from './storage';

describe('helpers/storage', () => {
  // Volto's test-setup-globals stubs localStorage with bare vi.fn()s, so
  // setItem is a no-op and getItem always returns undefined. Anything that
  // round-trips has to bring its own implementation.
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips a pick', () => {
    storeComponent('navigation', 'sc');
    expect(readStoredComponents()).toEqual({ navigation: 'sc' });
  });

  it('merges picks rather than replacing them', () => {
    storeComponent('navigation', 'sc');
    storeComponent('footer', 'vlt');
    expect(readStoredComponents()).toEqual({ navigation: 'sc', footer: 'vlt' });
  });

  it('overwrites a previous pick for the same slot', () => {
    storeComponent('navigation', 'sc');
    storeComponent('navigation', 'vlt');
    expect(readStoredComponents()).toEqual({ navigation: 'vlt' });
  });

  it('returns an empty object when nothing is stored', () => {
    expect(readStoredComponents()).toEqual({});
  });

  it('clears every pick', () => {
    storeComponent('navigation', 'sc');
    clearStoredComponents();
    expect(readStoredComponents()).toEqual({});
  });

  it('returns an empty object for malformed JSON', () => {
    window.localStorage.setItem(SHOWCASE_STORAGE_KEY, '{not json');
    expect(readStoredComponents()).toEqual({});
  });

  it('returns an empty object for JSON that is not an object', () => {
    window.localStorage.setItem(SHOWCASE_STORAGE_KEY, '"sc"');
    expect(readStoredComponents()).toEqual({});
  });

  it('returns an empty object for a stored null', () => {
    window.localStorage.setItem(SHOWCASE_STORAGE_KEY, 'null');
    expect(readStoredComponents()).toEqual({});
  });

  it('does not throw when localStorage reads throw (private mode)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError');
      },
    });
    expect(() => readStoredComponents()).not.toThrow();
    expect(readStoredComponents()).toEqual({});
  });

  it('does not throw when localStorage writes throw (quota exceeded)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });
    expect(() => storeComponent('navigation', 'sc')).not.toThrow();
  });
});
