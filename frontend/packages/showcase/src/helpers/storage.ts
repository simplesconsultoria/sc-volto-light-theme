import type { ComponentSlot } from '@simplesconsultoria/volto-light-theme/helpers/settings';

export type StoredComponents = Partial<Record<ComponentSlot, string>>;

// Where the showcase keeps a visitor's component picks. Only ever read from
// this add-on, which a client build does not include at all.
export const SHOWCASE_STORAGE_KEY = 'vlt-showcase-components';

// localStorage throws rather than returning null in a few real cases: Safari
// private mode, disabled site data, and a quota-exceeded write. None of them
// should take the page down over a demo preference, so every access is guarded.
export function readStoredComponents(): StoredComponents {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SHOWCASE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // A hand-edited entry could be any JSON at all, including an array or null.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export function storeComponent(slot: ComponentSlot, name: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      SHOWCASE_STORAGE_KEY,
      JSON.stringify({ ...readStoredComponents(), [slot]: name }),
    );
  } catch {
    // A pick that cannot be persisted is not worth an exception.
  }
}

export function clearStoredComponents(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SHOWCASE_STORAGE_KEY);
  } catch {
    // See readStoredComponents.
  }
}
