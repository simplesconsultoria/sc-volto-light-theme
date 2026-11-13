/**
 * Turn a theme's settings into CSS custom properties.
 *
 * `theme/_root.scss` already reads these from custom properties, so applying a
 * theme is only a matter of overriding the right ones.
 */

import type {
  ColorGroup,
  BlockTheme,
  SerializedTheme,
  ThemeSettings,
} from '../types/theme';
import {
  LEGACY_THEME_ALIASES,
  parseCustomTheme,
  resolveThemeAlias,
} from '../config/blockThemes';

/**
 * The same shape the backend's `Color` field validates against.
 */
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

/**
 * Settings whose value must be a hex colour.
 *
 * Matched on the field name, so a colour added to `ISCVLTThemeDefinition` is
 * validated strictly without a change here — every colour there is named
 * `*_color`. A setting that does not match takes the general rule instead, so
 * naming a colour anything else would quietly relax its validation.
 */
const COLOR_FIELD = /_color(_light|_dark)?$/;

/**
 * Constructs that would end the declaration, open a new rule, or start a
 * comment — the ways a value escapes the slot it is written into.
 */
const CSS_STRUCTURE = /[;{}]|\/\*|\*\//;

/**
 * Constructs that fetch or evaluate rather than merely style: remote requests,
 * imports, legacy IE expressions, and backslash escapes that could smuggle any
 * of the above past the checks above.
 */
const CSS_UNSAFE = /url\s*\(|@import|expression\s*\(|\\/i;

/** Longest value we will write; theme settings are short by nature. */
const MAX_VALUE_LENGTH = 200;

/**
 * Whether a non-colour setting is safe to write into a `<style>` element.
 *
 * Deliberately permissive about *CSS* — `1.5rem`, `clamp(1rem, 2vw, 2rem)` and
 * `var(--x)` all pass — and strict about escaping the declaration. This is the
 * fallback so that a new kind of setting works on the frontend the moment it
 * exists on the backend, rather than being silently dropped.
 */
export function isSafeCssValue(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= MAX_VALUE_LENGTH &&
    !CSS_STRUCTURE.test(trimmed) &&
    !CSS_UNSAFE.test(trimmed)
  );
}

/**
 * Whether a setting may be written as the value of its custom property.
 *
 * Colour fields are held to the backend's own hex rule; everything else has to
 * clear :func:`isSafeCssValue`. Values reach a `<style>` element, so a setting
 * that fails is dropped rather than escaped.
 */
export function isValidSettingValue(field: string, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return COLOR_FIELD.test(field)
    ? HEX_COLOR.test(value.trim())
    : isSafeCssValue(value);
}

/**
 * Derive the custom property a theme field overrides.
 *
 * The mapping is mechanical — `primary_color` becomes `--primary-color` — so a
 * colour added to `ISCVLTThemeDefinition` needs no change here, as long as the
 * field is named after the token it sets.
 */
export function cssVariableFor(field: string): string {
  return `--${field.replace(/_/g, '-')}`;
}

/**
 * Unwrap the resolved settings from the serialized field.
 *
 * A theme deleted while still selected keeps its `token` and has an empty
 * `value`, which yields no custom properties and so falls back to the
 * stylesheet defaults.
 */

export function formatBackgroundImage(value?: string): string {
  if (!value || typeof value !== 'string') return 'none';
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'none') return 'none';
  if (trimmed.startsWith('url(')) return trimmed;
  if (trimmed.startsWith('data:')) return `url("${trimmed}")`;
  if (
    trimmed.startsWith('linear-gradient') ||
    trimmed.startsWith('radial-gradient') ||
    trimmed.startsWith('repeating-linear-gradient') ||
    trimmed.startsWith('repeating-radial-gradient') ||
    trimmed.startsWith('conic-gradient')
  ) {
    return trimmed;
  }
  return `url("${trimmed}")`;
}

export function colorGroupCustomProperties(
  cg: ColorGroup,
): Record<string, string> {
  const prefix = `--colorgroup-${cg.id}`;
  const props: Record<string, string> = {};

  if (cg.background_color_light && cg.background_color_dark) {
    props[`${prefix}-bg`] =
      `light-dark(${cg.background_color_light.trim()}, ${cg.background_color_dark.trim()})`;
  } else if (cg.background_color_light) {
    props[`${prefix}-bg`] = cg.background_color_light.trim();
  }

  if (cg.text_color_light && cg.text_color_dark) {
    props[`${prefix}-text`] =
      `light-dark(${cg.text_color_light.trim()}, ${cg.text_color_dark.trim()})`;
  } else if (cg.text_color_light) {
    props[`${prefix}-text`] = cg.text_color_light.trim();
  }

  if (cg.subtext_color_light && cg.subtext_color_dark) {
    props[`${prefix}-subtext`] =
      `light-dark(${cg.subtext_color_light.trim()}, ${cg.subtext_color_dark.trim()})`;
  } else if (cg.subtext_color_light) {
    props[`${prefix}-subtext`] = cg.subtext_color_light.trim();
  }

  if (cg.accent_color_light && cg.accent_color_dark) {
    props[`${prefix}-accent`] =
      `light-dark(${cg.accent_color_light.trim()}, ${cg.accent_color_dark.trim()})`;
  } else if (cg.accent_color_light) {
    props[`${prefix}-accent`] = cg.accent_color_light.trim();
  }

  if (cg.font_family) {
    props[`${prefix}-font-family`] = cg.font_family.trim();
  }

  const imgLightDesk = formatBackgroundImage(cg.bg_image_light_desktop);
  const imgLightMob = formatBackgroundImage(
    cg.bg_image_light_mobile || cg.bg_image_light_desktop,
  );
  const imgDarkDesk = formatBackgroundImage(
    cg.bg_image_dark_desktop || cg.bg_image_light_desktop,
  );
  const imgDarkMob = formatBackgroundImage(
    cg.bg_image_dark_mobile ||
      cg.bg_image_dark_desktop ||
      cg.bg_image_light_mobile ||
      cg.bg_image_light_desktop,
  );

  props[`${prefix}-bg-image-light-desktop`] = imgLightDesk;
  props[`${prefix}-bg-image-light-mobile`] = imgLightMob;
  props[`${prefix}-bg-image-dark-desktop`] = imgDarkDesk;
  props[`${prefix}-bg-image-dark-mobile`] = imgDarkMob;
  props[`${prefix}-bg-size`] = cg.bg_size?.trim() || 'auto';
  props[`${prefix}-bg-repeat`] = cg.bg_repeat?.trim() || 'repeat';
  props[`${prefix}-bg-position`] = cg.bg_position?.trim() || 'center';
  props[`${prefix}-bg-image`] = `var(${prefix}-bg-image-light-desktop, none)`;

  return props;
}

export function blockThemeCustomProperties(
  bt: BlockTheme,
): Record<string, string> {
  const prefix = `--block-theme-${bt.id}`;
  return {
    [`${prefix}-bg`]: `var(--colorgroup-${bt.back_color_group}-bg)`,
    [`${prefix}-text`]: `var(--colorgroup-${bt.back_color_group}-text)`,
    [`${prefix}-high-contrast`]: `var(--colorgroup-${bt.back_color_group}-text)`,
    [`${prefix}-low-contrast`]: `var(--colorgroup-${bt.back_color_group}-subtext)`,
    [`${prefix}-accent-color`]: `var(--colorgroup-${bt.back_color_group}-accent)`,
    [`${prefix}-font-family`]: `var(--colorgroup-${bt.back_color_group}-font-family, inherit)`,
    [`${prefix}-high-bg`]: `var(--colorgroup-${bt.front_color_group}-bg)`,
    [`${prefix}-top-text`]: `var(--colorgroup-${bt.front_color_group}-text)`,
    [`${prefix}-top-high-contrast`]: `var(--colorgroup-${bt.front_color_group}-text)`,
    [`${prefix}-top-low-contrast`]: `var(--colorgroup-${bt.front_color_group}-subtext)`,
    [`${prefix}-top-accent-color`]: `var(--colorgroup-${bt.front_color_group}-accent)`,
    [`${prefix}-top-font-family`]: `var(--colorgroup-${bt.front_color_group}-font-family, inherit)`,
  };
}

export function blockThemeUtilityClasses(
  blockThemes?: Record<string, BlockTheme> | BlockTheme[],
): string {
  if (!blockThemes) return '';
  const list = Array.isArray(blockThemes)
    ? blockThemes
    : Object.values(blockThemes);
  return list
    .filter((bt) => bt && typeof bt === 'object' && bt.id)
    .map(
      (bt) => `
.has--theme--${bt.id},
.blocks-group-wrapper.has--theme--${bt.id},
.blocks-group-wrapper.${bt.id} {
  --theme-color: var(--block-theme-${bt.id}-bg);
  --theme-foreground-color: var(--block-theme-${bt.id}-text);
  --theme-high-contrast-foreground-color: var(--block-theme-${bt.id}-high-contrast);
  --theme-low-contrast-foreground-color: var(--block-theme-${bt.id}-low-contrast);
  --theme-foreground-accent-color: var(--block-theme-${bt.id}-accent-color);
  --colorgroup-back-font: var(--block-theme-${bt.id}-font-family, inherit);
  --theme-high-contrast-color: var(--block-theme-${bt.id}-high-bg);
  --theme-top-foreground-color: var(--block-theme-${bt.id}-top-text);
  --theme-top-high-contrast-foreground-color: var(--block-theme-${bt.id}-top-high-contrast);
  --theme-top-low-contrast-foreground-color: var(--block-theme-${bt.id}-top-low-contrast);
  --theme-top-accent-color: var(--block-theme-${bt.id}-top-accent-color);
  --colorgroup-front-font: var(--block-theme-${bt.id}-top-font-family, inherit);
  --theme-border-color: var(--block-theme-${bt.id}-border, var(--colorgroup-${bt.back_color_group}-accent, var(--accent-color)));
  --theme-border-width: var(--block-theme-${bt.id}-border-width, 0);
  --theme-pattern-image: var(--block-theme-${bt.id}-pattern-image, none);
  --theme-pattern-opacity: var(--block-theme-${bt.id}-pattern-opacity, 0);
  --theme-bg-image: var(--block-theme-${bt.id}-pattern-image, var(--colorgroup-${bt.back_color_group}-bg-image, none));
  --theme-bg-size: var(--colorgroup-${bt.back_color_group}-bg-size, auto);
  --theme-bg-repeat: var(--colorgroup-${bt.back_color_group}-bg-repeat, repeat);
  --theme-bg-position: var(--colorgroup-${bt.back_color_group}-bg-position, center);
  background-image: var(--theme-bg-image);
  background-size: var(--theme-bg-size);
  background-repeat: var(--theme-bg-repeat);
  background-position: var(--theme-bg-position);
}`,
    )
    .join('\n');
}

/**
 * Group wrapper selectors for legacy theme names whose back Color Group is
 * `groupId`, each followed by a comma — empty when there are none.
 *
 * VLT names a group wrapper after the theme saved on its blocks, so a block
 * still saved as `grey` sits in `.blocks-group-wrapper.grey`, which the
 * `custom-<back>-` selector does not match: its band got the colour of
 * `custom-secondary-primary` but never the Color Group's background layer.
 * A project that defines its own theme under that name keeps it.
 */
function legacyAliasSelectors(groupId: string): string {
  return Object.keys(LEGACY_THEME_ALIASES)
    .filter(
      (alias) => parseCustomTheme(resolveThemeAlias(alias))?.back === groupId,
    )
    .map((alias) => `.blocks-group-wrapper.${alias},\n`)
    .join('');
}

export function colorGroupUtilityClasses(
  colorGroups?: Record<string, ColorGroup> | ColorGroup[],
): string {
  if (!colorGroups) return '';
  const list = Array.isArray(colorGroups)
    ? colorGroups
    : Object.values(colorGroups);
  return list
    .filter((cg) => cg && typeof cg === 'object' && cg.id)
    .map(
      (cg) => `
.has-back-colorgroup-${cg.id},
.blocks-group-wrapper.has-back-colorgroup-${cg.id},
${legacyAliasSelectors(cg.id)}.blocks-group-wrapper[class*="custom-${cg.id}-"] {
  --theme-color: var(--colorgroup-${cg.id}-bg);
  --theme-foreground-color: var(--colorgroup-${cg.id}-text);
  --theme-high-contrast-foreground-color: var(--colorgroup-${cg.id}-text);
  --theme-low-contrast-foreground-color: var(--colorgroup-${cg.id}-subtext);
  --theme-foreground-accent-color: var(--colorgroup-${cg.id}-accent);
  --colorgroup-back-font: var(--colorgroup-${cg.id}-font-family, inherit);
  --theme-bg-image: var(--colorgroup-${cg.id}-bg-image, none);
  --theme-bg-size: var(--colorgroup-${cg.id}-bg-size, auto);
  --theme-bg-repeat: var(--colorgroup-${cg.id}-bg-repeat, repeat);
  --theme-bg-position: var(--colorgroup-${cg.id}-bg-position, center);
  background-image: var(--theme-bg-image);
  background-size: var(--theme-bg-size);
  background-repeat: var(--theme-bg-repeat);
  background-position: var(--theme-bg-position);
}
.has-front-colorgroup-${cg.id} {
  --theme-high-contrast-color: var(--colorgroup-${cg.id}-bg);
  --theme-top-foreground-color: var(--colorgroup-${cg.id}-text);
  --theme-top-high-contrast-foreground-color: var(--colorgroup-${cg.id}-text);
  --theme-top-low-contrast-foreground-color: var(--colorgroup-${cg.id}-subtext);
  --theme-top-accent-color: var(--colorgroup-${cg.id}-accent);
  --colorgroup-front-font: var(--colorgroup-${cg.id}-font-family, inherit);
  --theme-top-bg-image: var(--colorgroup-${cg.id}-bg-image, none);
  --theme-top-bg-size: var(--colorgroup-${cg.id}-bg-size, auto);
  --theme-top-bg-repeat: var(--colorgroup-${cg.id}-bg-repeat, repeat);
  --theme-top-bg-position: var(--colorgroup-${cg.id}-bg-position, center);
  --colorgroup-front-bg-image: var(--colorgroup-${cg.id}-bg-image, none);
  --colorgroup-front-bg-size: var(--colorgroup-${cg.id}-bg-size, auto);
  --colorgroup-front-bg-repeat: var(--colorgroup-${cg.id}-bg-repeat, repeat);
  --colorgroup-front-bg-position: var(--colorgroup-${cg.id}-bg-position, center);
}`,
    )
    .join('\n');
}

export function colorGroupResponsiveImageRules(
  colorGroups?: Record<string, ColorGroup> | ColorGroup[],
): string {
  if (!colorGroups) return '';
  const list = Array.isArray(colorGroups)
    ? colorGroups
    : Object.values(colorGroups);
  const active = list.filter(
    (cg) =>
      cg &&
      typeof cg === 'object' &&
      cg.id &&
      (cg.bg_image_light_desktop ||
        cg.bg_image_light_mobile ||
        cg.bg_image_dark_desktop ||
        cg.bg_image_dark_mobile),
  );
  if (active.length === 0) return '';

  const mobileLightDecls = active
    .map(
      (cg) =>
        `  --colorgroup-${cg.id}-bg-image: var(--colorgroup-${cg.id}-bg-image-light-mobile, var(--colorgroup-${cg.id}-bg-image-light-desktop, none));`,
    )
    .join('\n');

  const darkDeskDecls = active
    .map(
      (cg) =>
        `  --colorgroup-${cg.id}-bg-image: var(--colorgroup-${cg.id}-bg-image-dark-desktop, var(--colorgroup-${cg.id}-bg-image-light-desktop, none));`,
    )
    .join('\n');

  const darkMobDecls = active
    .map(
      (cg) =>
        `  --colorgroup-${cg.id}-bg-image: var(--colorgroup-${cg.id}-bg-image-dark-mobile, var(--colorgroup-${cg.id}-bg-image-dark-desktop, var(--colorgroup-${cg.id}-bg-image-light-mobile, none)));`,
    )
    .join('\n');

  return `
@media (max-width: 768px) {
  :root {
${mobileLightDecls}
  }
}
[data-theme='dark'] {
${darkDeskDecls}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${darkDeskDecls}
  }
}
@media (max-width: 768px) {
  [data-theme='dark'] {
${darkMobDecls}
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
${darkMobDecls}
    }
  }
}`;
}

/**
 * Unwrap the resolved settings from the serialized field.
 *
 * A theme deleted while still selected keeps its `token` and has an empty
 * `value`, which yields no custom properties and so falls back to the
 * stylesheet defaults.
 */
export function themeSettingsOf(
  theme: SerializedTheme | null | undefined,
): ThemeSettings | undefined {
  return theme?.value;
}

/**
 * Map a theme's settings onto `custom property -> value`, dropping anything
 * that fails validation for its field — see :func:`isValidSettingValue`.
 */
export function themeCustomProperties(
  settings: ThemeSettings | null | undefined,
): Record<string, string> {
  if (!settings) return {};

  const properties: Record<string, string> = {};
  for (const [field, value] of Object.entries(settings)) {
    if (isValidSettingValue(field, value)) {
      properties[cssVariableFor(field)] = (value as string).trim();
    }
  }
  return properties;
}

/**
 * Render a theme as a CSS rule for `:root`, or an empty string when the theme
 * contributes nothing — so a caller can skip the `<style>` element entirely.
 */
export function themeStyleSheet(
  settings: ThemeSettings | null | undefined,
  selector = ':root',
): string {
  const properties = { ...themeCustomProperties(settings) };

  // Add properties from color_groups
  if (settings?.color_groups) {
    const cgs = Array.isArray(settings.color_groups)
      ? settings.color_groups
      : Object.values(settings.color_groups);
    const groupsById: Record<string, ColorGroup> = {};
    for (const cg of cgs) {
      if (cg && typeof cg === 'object' && cg.id) {
        groupsById[cg.id] = cg;
        Object.assign(properties, colorGroupCustomProperties(cg));
      }
    }

    // Bridge standard ColorGroups to site-wide semantic tokens
    const bridgeGroup = (groupKey: string, tokenName: string) => {
      const g = groupsById[groupKey];
      if (!g) return;

      if (g.background_color_light) {
        properties[`--${tokenName}-color-light`] =
          g.background_color_light.trim();
      }
      if (g.background_color_dark) {
        properties[`--${tokenName}-color-dark`] =
          g.background_color_dark.trim();
      }
      if (g.background_color_light && g.background_color_dark) {
        properties[`--${tokenName}-color`] =
          `light-dark(${g.background_color_light.trim()}, ${g.background_color_dark.trim()})`;
      } else if (g.background_color_light) {
        properties[`--${tokenName}-color`] = g.background_color_light.trim();
      }

      if (g.text_color_light) {
        properties[`--${tokenName}-foreground-color-light`] =
          g.text_color_light.trim();
      }
      if (g.text_color_dark) {
        properties[`--${tokenName}-foreground-color-dark`] =
          g.text_color_dark.trim();
      }
      if (g.text_color_light && g.text_color_dark) {
        properties[`--${tokenName}-foreground-color`] =
          `light-dark(${g.text_color_light.trim()}, ${g.text_color_dark.trim()})`;
      } else if (g.text_color_light) {
        properties[`--${tokenName}-foreground-color`] =
          g.text_color_light.trim();
      }

      if (g.subtext_color_light) {
        properties[`--${tokenName}-low-foreground-color-light`] =
          g.subtext_color_light.trim();
      }
      if (g.subtext_color_dark) {
        properties[`--${tokenName}-low-foreground-color-dark`] =
          g.subtext_color_dark.trim();
      }
      if (g.subtext_color_light && g.subtext_color_dark) {
        properties[`--${tokenName}-low-foreground-color`] =
          `light-dark(${g.subtext_color_light.trim()}, ${g.subtext_color_dark.trim()})`;
      } else if (g.subtext_color_light) {
        properties[`--${tokenName}-low-foreground-color`] =
          g.subtext_color_light.trim();
      }

      if (g.accent_color_light) {
        properties[`--${tokenName}-accent-color-light`] =
          g.accent_color_light.trim();
      }
      if (g.accent_color_dark) {
        properties[`--${tokenName}-accent-color-dark`] =
          g.accent_color_dark.trim();
      }
      if (g.accent_color_light && g.accent_color_dark) {
        properties[`--${tokenName}-accent-color`] =
          `light-dark(${g.accent_color_light.trim()}, ${g.accent_color_dark.trim()})`;
      } else if (g.accent_color_light) {
        properties[`--${tokenName}-accent-color`] = g.accent_color_light.trim();
      }
    };

    bridgeGroup('primary', 'primary');
    bridgeGroup('secondary', 'secondary');
    bridgeGroup('accent', 'accent');
    bridgeGroup('neutral', 'neutral');

    if (groupsById.primary?.font_family) {
      const font = groupsById.primary.font_family.trim();
      // `body` derives its fonts from `--font-family-primary` (_globals.scss),
      // so without it the primary group font would stop at `:root`.
      properties['--font-family-primary'] = font;
      properties['--font-sans'] = font;
      properties['--custom-font'] = font;
      properties['--custom-main-font'] = font;
      properties['--font-body'] = font;
    }

    if (!properties['--header-background']) {
      properties['--header-background'] = 'var(--primary-color)';
    }
    if (!properties['--header-foreground']) {
      properties['--header-foreground'] = 'var(--primary-foreground-color)';
    }
    if (!properties['--footer-background']) {
      properties['--footer-background'] = 'var(--secondary-color)';
    }
    if (!properties['--footer-foreground']) {
      properties['--footer-foreground'] = 'var(--secondary-foreground-color)';
    }
    if (!properties['--link-foreground-color']) {
      // The primary group's accent: a text colour chosen for the page ground
      // in each colour mode. `--accent-color` is the accent group's *surface*
      // (dark blue), which on the dark-mode page is unreadable.
      properties['--link-foreground-color'] = 'var(--primary-accent-color)';
    }
  }

  // Add properties from block_themes
  if (settings?.block_themes) {
    const bts = Array.isArray(settings.block_themes)
      ? settings.block_themes
      : Object.values(settings.block_themes);
    for (const bt of bts) {
      if (bt && typeof bt === 'object' && bt.id) {
        Object.assign(properties, blockThemeCustomProperties(bt));
      }
    }
  }

  const declarations = Object.entries(properties)
    .map(([variable, value]) => `  ${variable}: ${value};`)
    .join('\n');

  const rootRule = declarations ? `${selector} {\n${declarations}\n}` : '';
  const utilities = settings?.color_groups
    ? colorGroupUtilityClasses(settings.color_groups)
    : '';
  const blockThemeUtilities = settings?.block_themes
    ? blockThemeUtilityClasses(settings.block_themes)
    : '';
  const responsiveImageRules = settings?.color_groups
    ? colorGroupResponsiveImageRules(settings.color_groups)
    : '';

  return [rootRule, utilities, blockThemeUtilities, responsiveImageRules]
    .filter(Boolean)
    .join('\n');
}
