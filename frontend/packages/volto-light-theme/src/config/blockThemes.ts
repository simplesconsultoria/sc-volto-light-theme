/**
 * The block-theme factory.
 *
 * Kept apart from `config/blocks` deliberately: the mapping has no dependency on
 * block registration, and importing it from there pulls in every registered block.
 * `_root.scss` must declare a `--block-theme-{name}-*` token for each property this
 * maps — a `var()` with no definition and no fallback is invalid at computed-value
 * time, so the whole declaration is dropped. `theme/blockThemes.test.ts` guards it.
 */

import type { ColorGroup, BlockTheme } from '../types/theme';

export interface ThemeDefinition {
  style: Record<string, string>;
  name: string;
  label: string;
}

/**
 * Create a complete theme definition by mapping every `--theme-*` variable
 * to its `--block-theme-{name}-*` counterpart.
 *
 * @param name  — Machine name used as the CSS token root (e.g. `"default"`, `"brand"`).
 * @param label — Human-readable label shown in the editor color picker.
 */
export function createThemeDefinition(
  name: string,
  label: string,
): ThemeDefinition {
  const v = (suffix: string) => `var(--block-theme-${name}-${suffix})`;
  return {
    style: {
      // Ground
      '--theme-color': v('bg'),
      '--theme-foreground-color': v('text'),
      '--theme-high-contrast-foreground-color': v('high-contrast'),
      '--theme-low-contrast-foreground-color': v('low-contrast'),
      '--theme-foreground-accent-color': v('accent-color'),
      // High Ground
      '--theme-high-contrast-color': v('high-bg'),
      '--theme-top-foreground-color': v('top-text'),
      '--theme-top-high-contrast-foreground-color': v('top-high-contrast'),
      '--theme-top-low-contrast-foreground-color': v('top-low-contrast'),
      '--theme-top-accent-color': v('top-accent-color'),
      // Border
      '--theme-border-color': v('border'),
      '--theme-border-width': v('border-width'),
      // Pattern (optional)
      '--theme-pattern-image': v('pattern-image'),
      '--theme-pattern-opacity': v('pattern-opacity'),
    },
    name,
    label,
  };
}

export const DEFAULT_COLOR_GROUPS: Record<string, ColorGroup> = {
  primary: {
    id: 'primary',
    name: 'Primary',
    font_family: 'Inter, sans-serif',
    background_color_light: '#ffffff',
    background_color_dark: '#000000',
    text_color_light: '#000000',
    text_color_dark: '#ffffff',
    subtext_color_light: '#333333',
    subtext_color_dark: '#f8f8f8',
    accent_color_light: '#b55e1c',
    accent_color_dark: '#f4822c',
  },
  secondary: {
    id: 'secondary',
    name: 'Secondary',
    font_family: 'Inter, sans-serif',
    background_color_light: '#000000',
    background_color_dark: '#ffffff',
    text_color_light: '#ffffff',
    text_color_dark: '#000000',
    subtext_color_light: '#e6e6e6',
    subtext_color_dark: '#333333',
    accent_color_light: '#f4822c',
    accent_color_dark: '#f4822c',
  },
  accent: {
    id: 'accent',
    name: 'Accent',
    font_family: 'Inter, sans-serif',
    background_color_light: '#f4822c',
    background_color_dark: '#b55e1c',
    text_color_light: '#000000',
    text_color_dark: '#ffffff',
    subtext_color_light: '#333333',
    subtext_color_dark: '#f8f8f8',
    accent_color_light: '#000000',
    accent_color_dark: '#ffffff',
  },
  neutral: {
    id: 'neutral',
    name: 'Neutral',
    font_family: 'Inter, sans-serif',
    background_color_light: '#edeff0',
    background_color_dark: '#333333',
    text_color_light: '#000000',
    text_color_dark: '#ffffff',
    subtext_color_light: '#333333',
    subtext_color_dark: '#e6e6e6',
    accent_color_light: '#f4822c',
    accent_color_dark: '#f4822c',
  },
};

export const DEFAULT_BLOCK_THEMES: Record<string, BlockTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    back_color_group: 'primary',
    front_color_group: 'neutral',
  },
  alternative: {
    id: 'alternative',
    name: 'Alternative',
    back_color_group: 'accent',
    front_color_group: 'primary',
  },
};

export const NATAL_COLOR_GROUPS: Record<string, ColorGroup> = {
  primary: {
    id: 'primary',
    name: 'Primary',
    font_family: 'Inter, sans-serif',
    background_color_light: '#ffffff',
    background_color_dark: '#0d2317',
    text_color_light: '#143d24',
    text_color_dark: '#f0f7f2',
    subtext_color_light: '#436650',
    subtext_color_dark: '#a3c4b0',
    accent_color_light: '#c41e3a',
    accent_color_dark: '#ea4335',
  },
  secondary: {
    id: 'secondary',
    name: 'Secondary',
    font_family: 'Inter, sans-serif',
    background_color_light: '#165b33',
    background_color_dark: '#071a10',
    text_color_light: '#ffffff',
    text_color_dark: '#ffffff',
    subtext_color_light: '#d1e7dd',
    subtext_color_dark: '#c0d6c8',
    accent_color_light: '#f8b229',
    accent_color_dark: '#f8b229',
  },
  accent: {
    id: 'accent',
    name: 'Accent',
    font_family: 'Inter, sans-serif',
    background_color_light: '#c41e3a',
    background_color_dark: '#7d1222',
    text_color_light: '#ffffff',
    text_color_dark: '#ffffff',
    subtext_color_light: '#ffe5e8',
    subtext_color_dark: '#ffd0d5',
    accent_color_light: '#f8b229',
    accent_color_dark: '#f8b229',
  },
  neutral: {
    id: 'neutral',
    name: 'Neutral',
    font_family: 'Inter, sans-serif',
    background_color_light: '#f2f7f4',
    background_color_dark: '#1b3024',
    text_color_light: '#143d24',
    text_color_dark: '#ffffff',
    subtext_color_light: '#52735f',
    subtext_color_dark: '#b5d0c0',
    accent_color_light: '#c41e3a',
    accent_color_dark: '#f8b229',
  },
};

export const NATAL_BLOCK_THEMES: Record<string, BlockTheme> = {
  default: {
    id: 'default',
    name: 'Primary',
    back_color_group: 'primary',
    front_color_group: 'neutral',
  },
  alternative: {
    id: 'alternative',
    name: 'Alternative',
    back_color_group: 'accent',
    front_color_group: 'primary',
  },
};

export const BASE_COLOR_GROUP_IDS = [
  'primary',
  'secondary',
  'accent',
  'neutral',
];

export const BASE_BLOCK_THEME_IDS = ['default', 'alternative'];

export interface ResolveBlockThemeOptions {
  theme?: string | any;
  backColorGroup?: string;
  frontColorGroup?: string;
  themeDefinitions?: ThemeDefinition[];
  blockThemes?: Record<string, BlockTheme>;
}

export interface ResolvedBlockTheme {
  style: React.CSSProperties;
  className: string;
  backColorGroup: string;
  frontColorGroup: string;
  theme: string;
}

/**
 * Resolves the block theme preset and the back/front ColorGroups.
 * Back ColorGroup controls the block ground (background, headline/title, buttons).
 * Front ColorGroup controls the high ground (cards, chips, card title and subtext).
 */
export function resolveBlockTheme(
  options: ResolveBlockThemeOptions = {},
): ResolvedBlockTheme {
  const {
    theme: rawTheme = 'default',
    backColorGroup: directBack,
    frontColorGroup: directFront,
    themeDefinitions = [],
    blockThemes = DEFAULT_BLOCK_THEMES,
  } = options;

  const theme =
    typeof rawTheme === 'object' && rawTheme !== null
      ? (rawTheme as any).theme || 'default'
      : rawTheme || 'default';

  let customBack: string | undefined;
  let customFront: string | undefined;
  if (typeof theme === 'string' && theme.startsWith('custom-')) {
    const parts = theme.split('-');
    customBack = parts[1];
    customFront = parts[2];
  }

  const currentBlockTheme =
    blockThemes[theme] ||
    (theme === 'brand' ? blockThemes['alternative'] : undefined) ||
    DEFAULT_BLOCK_THEMES[theme] ||
    (theme === 'brand' ? DEFAULT_BLOCK_THEMES['alternative'] : undefined);

  const resolvedBack =
    directBack ||
    (typeof rawTheme === 'object' && rawTheme !== null
      ? (rawTheme as any).backColorGroup
      : undefined) ||
    customBack ||
    currentBlockTheme?.back_color_group ||
    'primary';
  const resolvedFront =
    directFront ||
    (typeof rawTheme === 'object' && rawTheme !== null
      ? (rawTheme as any).frontColorGroup
      : undefined) ||
    customFront ||
    currentBlockTheme?.front_color_group ||
    'neutral';

  const themeDef =
    themeDefinitions.find((t) => t.name === theme) ||
    (theme === 'brand'
      ? themeDefinitions.find((t) => t.name === 'alternative')
      : undefined);
  const baseStyle: Record<string, string> = themeDef?.style
    ? { ...themeDef.style }
    : {};

  const isCustom = typeof theme === 'string' && theme.startsWith('custom');

  const style: React.CSSProperties = {
    '--theme-color': `var(--colorgroup-${resolvedBack}-bg, var(--${resolvedBack}-color, var(--primary-color)))`,
    '--theme-foreground-color': `var(--colorgroup-${resolvedBack}-text, var(--${resolvedBack}-foreground-color, var(--primary-foreground-color)))`,
    '--theme-high-contrast-foreground-color': `var(--colorgroup-${resolvedBack}-text, var(--${resolvedBack}-foreground-color, var(--primary-foreground-color)))`,
    '--theme-low-contrast-foreground-color': `var(--colorgroup-${resolvedBack}-subtext, var(--${resolvedBack}-low-foreground-color, var(--primary-low-foreground-color)))`,
    '--theme-foreground-accent-color': `var(--colorgroup-${resolvedBack}-accent, var(--${resolvedBack}-accent-color, var(--primary-accent-color)))`,
    '--colorgroup-back-font': `var(--colorgroup-${resolvedBack}-font-family, inherit)`,

    '--theme-high-contrast-color': `var(--colorgroup-${resolvedFront}-bg, var(--${resolvedFront}-color, var(--neutral-color)))`,
    '--theme-top-foreground-color': `var(--colorgroup-${resolvedFront}-text, var(--${resolvedFront}-foreground-color, var(--neutral-foreground-color)))`,
    '--theme-top-high-contrast-foreground-color': `var(--colorgroup-${resolvedFront}-text, var(--${resolvedFront}-foreground-color, var(--neutral-foreground-color)))`,
    '--theme-top-low-contrast-foreground-color': `var(--colorgroup-${resolvedFront}-subtext, var(--${resolvedFront}-low-foreground-color, var(--neutral-low-foreground-color)))`,
    '--theme-top-accent-color': `var(--colorgroup-${resolvedFront}-accent, var(--${resolvedFront}-accent-color, var(--neutral-accent-color)))`,
    '--colorgroup-front-font': `var(--colorgroup-${resolvedFront}-font-family, inherit)`,
    ...(isCustom ? {} : baseStyle),
  } as React.CSSProperties;

  const classNames = [
    theme ? `has--theme--${theme}` : '',
    typeof theme === 'string' && theme.startsWith('custom-')
      ? 'has--theme--custom'
      : '',
    resolvedBack ? `has-back-colorgroup-${resolvedBack}` : '',
    resolvedFront ? `has-front-colorgroup-${resolvedFront}` : '',
  ].filter(Boolean);

  return {
    style,
    className: classNames.join(' '),
    backColorGroup: resolvedBack,
    frontColorGroup: resolvedFront,
    theme,
  };
}
