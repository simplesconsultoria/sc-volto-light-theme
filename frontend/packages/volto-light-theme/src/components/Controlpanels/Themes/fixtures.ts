/**
 * Sample payloads for the stories.
 *
 * Shaped like what `@controlpanels/themes` serves, so a story shows the real
 * component against real data rather than a convenient simplification. Not a
 * `*.stories.*` file, so Storybook does not try to render it.
 */
import type { JsonSchema, ThemeItem } from '../../../types/theme';

export const defaultTheme: ThemeItem = {
  '@id': 'http://localhost:8080/Plone/@controlpanels/themes/default',
  id: 'default',
  name: 'Default',
  description: 'The theme shipped with sc.voltolighttheme.',
  primary_color: '#ffffff',
  primary_foreground_color: '#000000',
  header_foreground_color: '#000000',
  secondary_color: '#000000',
  secondary_foreground_color: '#ffffff',
  accent_color: '#f4822c',
  accent_foreground_color: '#000000',
};

export const corporateTheme: ThemeItem = {
  '@id': 'http://localhost:8080/Plone/@controlpanels/themes/corporate',
  id: 'corporate',
  name: 'Corporate',
  description: 'Blues, for a public-facing site.',
  primary_color: '#123456',
  primary_foreground_color: '#ffffff',
  header_foreground_color: '#ffffff',
  secondary_color: '#1b3a5c',
  secondary_foreground_color: '#ffffff',
  accent_color: '#4a90d9',
  accent_foreground_color: '#000000',
};

export const natalTheme: ThemeItem = {
  '@id': 'http://localhost:8080/Plone/@controlpanels/themes/natal',
  id: 'natal',
  name: 'Natal',
  description: 'Um tema festivo com tipografia Inter e bordas arredondadas.',
  primary_color: '#d32f2f',
  primary_foreground_color: '#ffffff',
  header_foreground_color: '#ffffff',
  secondary_color: '#2e7d32',
  secondary_foreground_color: '#ffffff',
  accent_color: '#fbc02d',
  accent_foreground_color: '#000000',
};

export const themes: ThemeItem[] = [defaultTheme, corporateTheme, natalTheme];

/**
 * A trimmed `ISCVLTThemeDefinition` schema, as `plone.restapi` renders it.
 *
 * The colour fields are deliberately *not* marked `widget: 'colorPicker'`.
 * Upstream's colour picker reads `config.settings.colorMap[props.id]` with no
 * guard, and in Storybook that map is never populated — the add-on's
 * `applyConfig` does not run there — so a story using it throws during render
 * and shows an empty frame. Plain string fields render through Volto's default
 * text widget, which is what makes these stories show real, editable inputs.
 */
export const schema: JsonSchema = {
  type: 'object',
  properties: {
    name: { title: 'Theme name', type: 'string' },
    description: { title: 'Description', type: 'string' },
    primary_color: { title: 'Primary colour', type: 'string' },
    accent_color: { title: 'Accent colour', type: 'string' },
  },
  required: ['name'],
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['name', 'description', 'primary_color', 'accent_color'],
    },
  ],
};
