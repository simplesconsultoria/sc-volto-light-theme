/**
 * The block-theme factory.
 *
 * Kept apart from `config/blocks` deliberately: the mapping has no dependency on
 * block registration, and importing it from there pulls in every registered block.
 * `_root.scss` must declare a `--block-theme-{name}-*` token for each property this
 * maps — a `var()` with no definition and no fallback is invalid at computed-value
 * time, so the whole declaration is dropped. `theme/blockThemes.test.ts` guards it.
 */

import config from '@plone/volto/registry';
import { defineMessages, type MessageDescriptor } from 'react-intl';
import type { ColorGroup, BlockTheme } from '../types/theme';

export interface ThemeDefinition {
  style: Record<string, string>;
  name: string;
  label: string;
}

/**
 * Resolves available theme definitions for a specific block or site fallback.
 */
export function getThemeDefinitions(blockType?: string): ThemeDefinition[] {
  const blockThemes = blockType
    ? (config.blocks?.blocksConfig as any)?.[blockType]?.themes
    : undefined;

  return (blockThemes ||
    (config.blocks as any)?.themes ||
    []) as ThemeDefinition[];
}

export interface CssPatternPreset {
  id: string;
  /** Message descriptors: format them with `intl.formatMessage`. */
  label: MessageDescriptor;
  description: MessageDescriptor;
  css: string;
  defaultSize?: string;
  defaultRepeat?: string;
  defaultPosition?: string;
}

const presetMessages = defineMessages({
  none: { id: 'None', defaultMessage: 'None' },
  noneDescription: {
    id: 'No image or pattern (solid background colour only)',
    defaultMessage: 'No image or pattern (solid background colour only)',
  },
  dots: { id: 'Dots', defaultMessage: 'Dots' },
  dotsDescription: {
    id: 'Subtle dot pattern',
    defaultMessage: 'Subtle dot pattern',
  },
  grid: { id: 'Grid', defaultMessage: 'Grid' },
  gridDescription: {
    id: 'Modern square grid with transparency',
    defaultMessage: 'Modern square grid with transparency',
  },
  diagonalStripes: {
    id: 'Diagonal stripes',
    defaultMessage: 'Diagonal stripes',
  },
  diagonalStripesDescription: {
    id: 'Elegant diagonal stripes at 45 degrees',
    defaultMessage: 'Elegant diagonal stripes at 45 degrees',
  },
  waves: { id: 'Waves (Acreative)', defaultMessage: 'Waves (Acreative)' },
  wavesDescription: {
    id: 'Dynamic curved waves inspired by the Acreative project',
    defaultMessage: 'Dynamic curved waves inspired by the Acreative project',
  },
  blueprint: {
    id: 'Blueprint (fine grid)',
    defaultMessage: 'Blueprint (fine grid)',
  },
  blueprintDescription: {
    id: 'Double millimetre mesh in a technical blueprint style',
    defaultMessage: 'Double millimetre mesh in a technical blueprint style',
  },
  zigzag: { id: 'Zigzag / Chevron', defaultMessage: 'Zigzag / Chevron' },
  zigzagDescription: {
    id: 'Geometric zigzag pattern',
    defaultMessage: 'Geometric zigzag pattern',
  },
  radialMesh: { id: 'Radial mesh', defaultMessage: 'Radial mesh' },
  radialMeshDescription: {
    id: 'Pattern of concentric circles and radial dots',
    defaultMessage: 'Pattern of concentric circles and radial dots',
  },
});

export const CSS_PATTERN_PRESETS: CssPatternPreset[] = [
  {
    id: 'none',
    label: presetMessages.none,
    description: presetMessages.noneDescription,
    css: '',
  },
  {
    id: 'dots',
    label: presetMessages.dots,
    description: presetMessages.dotsDescription,
    css: 'radial-gradient(color-mix(in srgb, currentColor 18%, transparent) 1.5px, transparent 1.5px)',
    defaultSize: '24px 24px',
    defaultRepeat: 'repeat',
    defaultPosition: '0 0',
  },
  {
    id: 'grid',
    label: presetMessages.grid,
    description: presetMessages.gridDescription,
    css: 'linear-gradient(to right, color-mix(in srgb, currentColor 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, currentColor 12%, transparent) 1px, transparent 1px)',
    defaultSize: '32px 32px',
    defaultRepeat: 'repeat',
    defaultPosition: '0 0',
  },
  {
    id: 'diagonal-stripes',
    label: presetMessages.diagonalStripes,
    description: presetMessages.diagonalStripesDescription,
    css: 'repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 10%, transparent), color-mix(in srgb, currentColor 10%, transparent) 1.5px, transparent 1.5px, transparent 12px)',
    defaultSize: 'auto',
    defaultRepeat: 'repeat',
    defaultPosition: '0 0',
  },
  {
    id: 'waves-acreative',
    label: presetMessages.waves,
    description: presetMessages.wavesDescription,
    css: 'radial-gradient(44.72px at 50% 60px, color-mix(in srgb, currentColor 20%, transparent) 99%, #0000 101%) calc(50% - 40px) 0/80px 51% repeat-x, radial-gradient(44.72px at 50% -40px, #0000 99%, color-mix(in srgb, currentColor 20%, transparent) 101%) 50% 20px/80px calc(51% - 20px) repeat-x, radial-gradient(44.72px at 50% calc(100% - 60px), color-mix(in srgb, currentColor 20%, transparent) 99%, #0000 101%) calc(50% - 40px) 100%/80px 51% repeat-x, radial-gradient(44.72px at 50% calc(100% + 40px), #0000 99%, color-mix(in srgb, currentColor 20%, transparent) 101%) 50% calc(100% - 20px)/80px calc(51% - 20px) repeat-x',
    defaultSize: 'auto',
    defaultRepeat: 'repeat-x',
    defaultPosition: 'center',
  },
  {
    id: 'blueprint',
    label: presetMessages.blueprint,
    description: presetMessages.blueprintDescription,
    css: 'linear-gradient(color-mix(in srgb, currentColor 14%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, currentColor 14%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in srgb, currentColor 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, currentColor 6%, transparent) 1px, transparent 1px)',
    defaultSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
    defaultRepeat: 'repeat',
    defaultPosition: '0 0',
  },
  {
    id: 'zigzag',
    label: presetMessages.zigzag,
    description: presetMessages.zigzagDescription,
    css: 'linear-gradient(135deg, color-mix(in srgb, currentColor 12%, transparent) 25%, transparent 25%) -20px 0/40px 40px, linear-gradient(225deg, color-mix(in srgb, currentColor 12%, transparent) 25%, transparent 25%) -20px 0/40px 40px, linear-gradient(315deg, color-mix(in srgb, currentColor 12%, transparent) 25%, transparent 25%) 0 0/40px 40px, linear-gradient(45deg, color-mix(in srgb, currentColor 12%, transparent) 25%, transparent 25%) 0 0/40px 40px',
    defaultSize: '40px 40px',
    defaultRepeat: 'repeat',
    defaultPosition: '0 0',
  },
  {
    id: 'radial-mesh',
    label: presetMessages.radialMesh,
    description: presetMessages.radialMeshDescription,
    css: 'radial-gradient(color-mix(in srgb, currentColor 15%, transparent) 1px, color-mix(in srgb, transparent 20%, transparent) 2px) 0 0 / 30px 30px',
    defaultSize: '30px 30px',
    defaultRepeat: 'repeat',
    defaultPosition: '0 0',
  },
];

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
    background_color_dark: '#14171c',
    text_color_light: '#1d2129',
    text_color_dark: '#f1f3f5',
    subtext_color_light: '#4a5260',
    subtext_color_dark: '#b4bcc8',
    accent_color_light: '#1971c2',
    accent_color_dark: '#74c0fc',
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
  },
  secondary: {
    id: 'secondary',
    name: 'Secondary',
    font_family: 'Inter, sans-serif',
    background_color_light: '#eceff3',
    background_color_dark: '#1c2027',
    text_color_light: '#1d2129',
    text_color_dark: '#f1f3f5',
    subtext_color_light: '#4a5260',
    subtext_color_dark: '#b4bcc8',
    accent_color_light: '#1864ab',
    accent_color_dark: '#74c0fc',
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
  },
  accent: {
    id: 'accent',
    name: 'Accent',
    font_family: 'Inter, sans-serif',
    background_color_light: '#a5d8ff',
    background_color_dark: '#1c3a57',
    text_color_light: '#0b2239',
    text_color_dark: '#e7f5ff',
    subtext_color_light: '#1f3f5c',
    subtext_color_dark: '#b8d7ef',
    accent_color_light: '#0b2239',
    accent_color_dark: '#a5d8ff',
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
  },
  neutral: {
    id: 'neutral',
    name: 'Neutral',
    font_family: 'Inter, sans-serif',
    background_color_light: '#f6f7f9',
    background_color_dark: '#242932',
    text_color_light: '#1d2129',
    text_color_dark: '#f1f3f5',
    subtext_color_light: '#4a5260',
    subtext_color_dark: '#c3cad4',
    accent_color_light: '#1971c2',
    accent_color_dark: '#74c0fc',
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
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
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
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
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
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
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
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
    bg_image_light_desktop: '',
    bg_image_light_mobile: '',
    bg_image_dark_desktop: '',
    bg_image_dark_mobile: '',
    bg_size: 'auto',
    bg_repeat: 'repeat',
    bg_position: 'center',
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
  styles?: { theme?: string; [key: string]: any };
  backColorGroup?: string;
  frontColorGroup?: string;
  themeDefinitions?: ThemeDefinition[];
  blockThemes?: Record<string, BlockTheme>;
  [key: string]: any;
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
 * Can be called with full block `data` directly: `resolveBlockTheme(data)`.
 */
export function resolveBlockTheme(
  optionsOrData: ResolveBlockThemeOptions = {},
): ResolvedBlockTheme {
  const {
    theme: rawThemeExplicit,
    styles,
    backColorGroup: directBack,
    frontColorGroup: directFront,
    themeDefinitions: directThemeDefinitions,
    blockThemes = DEFAULT_BLOCK_THEMES,
  } = optionsOrData;

  const blockType = optionsOrData?.['@type'] as string | undefined;
  const rawTheme = rawThemeExplicit ?? styles?.theme ?? 'default';
  const themeDefinitions =
    directThemeDefinitions && directThemeDefinitions.length > 0
      ? directThemeDefinitions
      : getThemeDefinitions(blockType);

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

  const isCustom = typeof theme === 'string' && theme.startsWith('custom');

  const allBlockThemes: Record<string, BlockTheme> = {
    ...DEFAULT_BLOCK_THEMES,
    ...((config as any)?.blocks?.blockThemes || {}),
    ...(blockThemes || {}),
  };

  const currentBlockTheme =
    allBlockThemes[theme] ||
    (theme === 'brand' ? allBlockThemes['alternative'] : undefined) ||
    DEFAULT_BLOCK_THEMES[theme] ||
    (theme === 'brand' ? DEFAULT_BLOCK_THEMES['alternative'] : undefined);

  const resolvedBack = isCustom
    ? customBack ||
      directBack ||
      (typeof rawTheme === 'object' && rawTheme !== null
        ? (rawTheme as any).backColorGroup
        : undefined) ||
      'primary'
    : currentBlockTheme?.back_color_group ||
      directBack ||
      (typeof rawTheme === 'object' && rawTheme !== null
        ? (rawTheme as any).backColorGroup
        : undefined) ||
      'primary';

  const resolvedFront = isCustom
    ? customFront ||
      directFront ||
      (typeof rawTheme === 'object' && rawTheme !== null
        ? (rawTheme as any).frontColorGroup
        : undefined) ||
      'neutral'
    : currentBlockTheme?.front_color_group ||
      directFront ||
      (typeof rawTheme === 'object' && rawTheme !== null
        ? (rawTheme as any).frontColorGroup
        : undefined) ||
      'neutral';

  const themeDef =
    themeDefinitions.find((t) => t.name === theme) ||
    (theme === 'brand'
      ? themeDefinitions.find((t) => t.name === 'alternative')
      : undefined) ||
    (!isCustom && theme !== 'default'
      ? createThemeDefinition(theme, currentBlockTheme?.name || theme)
      : undefined);
  const baseStyle: Record<string, string> = themeDef?.style
    ? { ...themeDef.style }
    : {};

  const style: React.CSSProperties = {
    '--theme-color': `var(--block-theme-${theme}-bg, var(--colorgroup-${resolvedBack}-bg, var(--${resolvedBack}-color, var(--primary-color))))`,
    '--theme-foreground-color': `var(--block-theme-${theme}-text, var(--colorgroup-${resolvedBack}-text, var(--${resolvedBack}-foreground-color, var(--primary-foreground-color))))`,
    '--theme-high-contrast-foreground-color': `var(--block-theme-${theme}-high-contrast, var(--colorgroup-${resolvedBack}-text, var(--${resolvedBack}-foreground-color, var(--primary-foreground-color))))`,
    '--theme-low-contrast-foreground-color': `var(--block-theme-${theme}-low-contrast, var(--colorgroup-${resolvedBack}-subtext, var(--${resolvedBack}-low-foreground-color, var(--primary-low-foreground-color))))`,
    '--theme-foreground-accent-color': `var(--block-theme-${theme}-accent-color, var(--colorgroup-${resolvedBack}-accent, var(--${resolvedBack}-accent-color, var(--primary-accent-color))))`,
    '--colorgroup-back-font': `var(--block-theme-${theme}-font-family, var(--colorgroup-${resolvedBack}-font-family, inherit))`,

    '--theme-high-contrast-color': `var(--block-theme-${theme}-high-bg, var(--colorgroup-${resolvedFront}-bg, var(--${resolvedFront}-color, var(--neutral-color))))`,
    '--theme-top-foreground-color': `var(--block-theme-${theme}-top-text, var(--colorgroup-${resolvedFront}-text, var(--${resolvedFront}-foreground-color, var(--neutral-foreground-color))))`,
    '--theme-top-high-contrast-foreground-color': `var(--block-theme-${theme}-top-high-contrast, var(--colorgroup-${resolvedFront}-text, var(--${resolvedFront}-foreground-color, var(--neutral-foreground-color))))`,
    '--theme-top-low-contrast-foreground-color': `var(--block-theme-${theme}-top-low-contrast, var(--colorgroup-${resolvedFront}-subtext, var(--${resolvedFront}-low-foreground-color, var(--neutral-low-foreground-color))))`,
    '--theme-top-accent-color': `var(--block-theme-${theme}-top-accent-color, var(--colorgroup-${resolvedFront}-accent, var(--${resolvedFront}-accent-color, var(--neutral-accent-color))))`,
    '--colorgroup-front-font': `var(--block-theme-${theme}-top-font-family, var(--colorgroup-${resolvedFront}-font-family, inherit))`,
    '--highground-bg-image': `var(--colorgroup-${resolvedFront}-bg-image, none)`,
    '--highground-bg-size': `var(--colorgroup-${resolvedFront}-bg-size, auto)`,
    '--highground-bg-repeat': `var(--colorgroup-${resolvedFront}-bg-repeat, repeat)`,
    '--highground-bg-position': `var(--colorgroup-${resolvedFront}-bg-position, center)`,
    '--colorgroup-front-bg-image': `var(--colorgroup-${resolvedFront}-bg-image, none)`,
    '--colorgroup-front-bg-size': `var(--colorgroup-${resolvedFront}-bg-size, auto)`,
    '--colorgroup-front-bg-repeat': `var(--colorgroup-${resolvedFront}-bg-repeat, repeat)`,
    '--colorgroup-front-bg-position': `var(--colorgroup-${resolvedFront}-bg-position, center)`,
    '--theme-bg-image': `var(--block-theme-${theme}-pattern-image, var(--colorgroup-${resolvedBack}-bg-image, none))`,
    '--theme-bg-size': `var(--colorgroup-${resolvedBack}-bg-size, auto)`,
    '--theme-bg-repeat': `var(--colorgroup-${resolvedBack}-bg-repeat, repeat)`,
    '--theme-bg-position': `var(--colorgroup-${resolvedBack}-bg-position, center)`,
    backgroundImage: `var(--theme-bg-image, none)`,
    backgroundSize: `var(--theme-bg-size, auto)`,
    backgroundRepeat: `var(--theme-bg-repeat, repeat)`,
    backgroundPosition: `var(--theme-bg-position, center)`,
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
