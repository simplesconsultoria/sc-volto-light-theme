export type ThemeName = 'light' | 'dark' | 'high-contrast';

export const THEME_STORAGE_KEY = 'theme';
export const FONT_SCALE_STORAGE_KEY = 'accessibility:font-scale';
export const FONT_SCALE_MIN = 0.8;
export const FONT_SCALE_MAX = 1.3;
export const DEFAULT_FONT_SCALE = 1;

export const isThemeName = (value: string | null): value is ThemeName =>
  value === 'light' || value === 'dark' || value === 'high-contrast';

const applyThemeToBody = (themeToApply: ThemeName) => {
  if (typeof document === 'undefined') return;

  const apply = () => {
    document.body?.setAttribute('data-theme', themeToApply);
  };

  if (document.body) {
    apply();
    return;
  }

  document.addEventListener('DOMContentLoaded', apply, { once: true });
};

const applyFontScaleToBody = (normalizedScale: number) => {
  if (typeof document === 'undefined') return;

  const apply = () => {
    document.body?.setAttribute(
      'data-accessibility-font-scale',
      String(normalizedScale),
    );
  };

  if (document.body) {
    apply();
    return;
  }

  document.addEventListener('DOMContentLoaded', apply, { once: true });
};

export const resolveThemePreference = (): ThemeName => {
  if (typeof window === 'undefined') return 'light';

  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeName(savedTheme)) return savedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
};

export const applyTheme = (themeToApply: ThemeName) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  root.setAttribute('data-theme', themeToApply);
  applyThemeToBody(themeToApply);
};

export const getAppliedTheme = (): ThemeName | null => {
  if (typeof document === 'undefined') return null;

  const rootTheme = document.documentElement.getAttribute('data-theme');
  return isThemeName(rootTheme) ? rootTheme : null;
};

export const bootstrapTheme = () => {
  if (typeof document === 'undefined') return;

  applyTheme(resolveThemePreference());
};

const clampFontScale = (scale: number) =>
  Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, scale));

export const normalizeFontScale = (scale: number) =>
  Math.round(clampFontScale(scale) * 10) / 10;

export const getStoredFontScale = (): number => {
  if (typeof window === 'undefined') return DEFAULT_FONT_SCALE;

  try {
    const value = Number(window.localStorage.getItem(FONT_SCALE_STORAGE_KEY));
    return Number.isFinite(value)
      ? normalizeFontScale(value)
      : DEFAULT_FONT_SCALE;
  } catch {
    return DEFAULT_FONT_SCALE;
  }
};

export const applyFontScale = (scale: number) => {
  if (typeof document === 'undefined') return;

  const normalizedScale = normalizeFontScale(scale);

  document.documentElement.style.setProperty(
    '--font-scale',
    String(normalizedScale),
  );
  applyFontScaleToBody(normalizedScale);
};

export const bootstrapFontScale = () => {
  if (typeof document === 'undefined') return;

  applyFontScale(getStoredFontScale());
};

export const bootstrapAccessibilityPreferences = () => {
  bootstrapTheme();
  bootstrapFontScale();
};
