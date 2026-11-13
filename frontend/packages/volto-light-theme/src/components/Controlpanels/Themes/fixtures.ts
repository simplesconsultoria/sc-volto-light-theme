/**
 * Sample payloads for the stories.
 *
 * Shaped like what `@controlpanels/themes` serves, so a story shows the real
 * component against real data rather than a convenient simplification. Not a
 * `*.stories.*` file, so Storybook does not try to render it.
 */
import type { ColorGroup, JsonSchema, ThemeItem } from '../../../types/theme';

import {
  DEFAULT_COLOR_GROUPS,
  DEFAULT_BLOCK_THEMES,
  NATAL_COLOR_GROUPS,
  NATAL_BLOCK_THEMES,
} from '../../../config/blockThemes';

/**
 * Corporate: the default Color Groups with a navy ground in place of the light
 * blue `accent`, so the listing and the site-theme toolbar show a theme that
 * actually differs from the default.
 */
const CORPORATE_COLOR_GROUPS: Record<string, ColorGroup> = {
  ...DEFAULT_COLOR_GROUPS,
  accent: {
    ...DEFAULT_COLOR_GROUPS.accent,
    background_color_light: '#123456',
    background_color_dark: '#0b2239',
    text_color_light: '#ffffff',
    text_color_dark: '#e7f5ff',
    subtext_color_light: '#c5d6e8',
    subtext_color_dark: '#b8d7ef',
    accent_color_light: '#a5d8ff',
    accent_color_dark: '#74c0fc',
  },
  secondary: {
    ...DEFAULT_COLOR_GROUPS.secondary,
    background_color_light: '#e7eef6',
    background_color_dark: '#1b3a5c',
  },
};

export const defaultTheme: ThemeItem = {
  '@id': 'http://localhost:8080/Plone/@controlpanels/themes/default',
  id: 'default',
  name: 'Default',
  description: 'The theme shipped with sc.voltolighttheme.',
  color_groups: DEFAULT_COLOR_GROUPS,
  block_themes: DEFAULT_BLOCK_THEMES,
};

export const corporateTheme: ThemeItem = {
  '@id': 'http://localhost:8080/Plone/@controlpanels/themes/corporate',
  id: 'corporate',
  name: 'Corporate',
  description: 'Blues, for a public-facing site.',
  color_groups: CORPORATE_COLOR_GROUPS,
  block_themes: DEFAULT_BLOCK_THEMES,
};

export const natalTheme: ThemeItem = {
  '@id': 'http://localhost:8080/Plone/@controlpanels/themes/natal',
  id: 'natal',
  name: 'Natal',
  description: 'A festive theme with Inter typography and rounded borders.',
  color_groups: NATAL_COLOR_GROUPS,
  block_themes: NATAL_BLOCK_THEMES,
};

export const themes: ThemeItem[] = [defaultTheme, corporateTheme, natalTheme];

/**
 * A trimmed `ISCVLTThemeDefinition` schema, as `plone.restapi` renders it.
 *
 * Only the plain fields. The legacy colour fields are left out because
 * `enhanceThemeSchemaWidgets` strips them from the form anyway, and
 * `color_groups` / `block_themes` are left out because their widgets are
 * registered by the add-on's `applyConfig`, which does not run in Storybook.
 * The Color Groups and Block Themes editors have stories of their own.
 */
export const schema: JsonSchema = {
  type: 'object',
  properties: {
    name: { title: 'Theme name', type: 'string' },
    description: { title: 'Description', type: 'string' },
  },
  required: ['name'],
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['name', 'description'],
    },
  ],
};
