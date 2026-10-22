/**
 * Pure helpers for the themes control panel.
 *
 * The panel is a *collection*: `GET /@controlpanels/themes` answers with the
 * shared JSON schema plus one entry per theme, rather than the single `data`
 * object a regular registry panel returns. Everything here shapes that payload
 * for Volto's existing `Form`, so the component itself stays a thin shell.
 */

import type {
  JsonSchema,
  ThemeItem,
  ThemesControlpanelData,
} from '../types/theme';

export type { JsonSchema, ThemeItem, ThemesControlpanelData };

/** Id of the theme shipped with the add-on; the backend refuses to delete it. */
export const DEFAULT_THEME_ID = 'default';

/**
 * Whether a theme may be deleted. The default theme is protected server-side;
 * hiding the control avoids offering an action that can only fail.
 */
export function isDeletable(themeId: string): boolean {
  return themeId !== DEFAULT_THEME_ID;
}

/**
 * Same rule the backend applies: a theme id becomes part of a dotted registry
 * record name, so a dot would corrupt enumeration.
 */
export function isValidThemeId(themeId: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(themeId ?? '');
}

/**
 * The themes already defined, so the form can reject a duplicate before the
 * request round-trips.
 */
export function existingThemeIds(data?: ThemesControlpanelData): string[] {
  return (data?.items ?? []).map((item) => item.id);
}

/**
 * Look one theme up by id.
 */
export function findTheme(
  data: ThemesControlpanelData | undefined,
  themeId: string,
): ThemeItem | undefined {
  return (data?.items ?? []).find((item) => item.id === themeId);
}

/**
 * Legacy style fields superseded by ColorGroups and BlockThemes.
 * Stripped from the control panel form so they no longer appear.
 */
export const LEGACY_THEME_FIELDS = new Set([
  'font_family_primary',
  'font_family_secondary',
  'primary_color_light',
  'primary_color_dark',
  'primary_foreground_color_light',
  'primary_foreground_color_dark',
  'primary_low_foreground_color_light',
  'primary_low_foreground_color_dark',
  'primary_accent_color_light',
  'primary_accent_color_dark',
  'secondary_color_light',
  'secondary_color_dark',
  'secondary_foreground_color_light',
  'secondary_foreground_color_dark',
  'secondary_low_foreground_color_light',
  'secondary_low_foreground_color_dark',
  'secondary_accent_color_light',
  'secondary_accent_color_dark',
  'accent_color_light',
  'accent_color_dark',
  'accent_foreground_color_light',
  'accent_foreground_color_dark',
  'accent_low_foreground_color_light',
  'accent_low_foreground_color_dark',
  'accent_accent_color_light',
  'accent_accent_color_dark',
  'neutral_color_light',
  'neutral_color_dark',
  'neutral_foreground_color_light',
  'neutral_foreground_color_dark',
  'neutral_low_foreground_color_light',
  'neutral_low_foreground_color_dark',
  'neutral_accent_color_light',
  'neutral_accent_color_dark',
  'event_color_light',
  'event_color_dark',
  'file_color_light',
  'file_color_dark',
  'image_color_light',
  'image_color_dark',
]);

/**
 * Enhance schema properties with custom widgets for color_groups and block_themes,
 * and strip legacy color/typography fields from the control panel.
 */
export function enhanceThemeSchemaWidgets(schema: JsonSchema): JsonSchema {
  const properties: Record<string, any> = {};
  for (const [key, val] of Object.entries(schema.properties ?? {})) {
    if (!LEGACY_THEME_FIELDS.has(key)) {
      properties[key] = val;
    }
  }

  if (properties.color_groups) {
    properties.color_groups = {
      ...properties.color_groups,
      widget: 'color_groups_widget',
    };
  }
  if (properties.block_themes) {
    properties.block_themes = {
      ...properties.block_themes,
      widget: 'block_themes_widget',
    };
  }

  const allowedFieldsets = ['default', 'colorgroups', 'blockthemes'];
  const fieldsets = schema.fieldsets
    ? schema.fieldsets
        .filter((fs) => allowedFieldsets.includes(fs.id))
        .map((fs) => ({
          ...fs,
          fields: fs.fields.filter((field) => !LEGACY_THEME_FIELDS.has(field)),
        }))
    : undefined;

  return {
    ...schema,
    properties,
    ...(fieldsets ? { fieldsets } : {}),
  };
}

/**
 * The schema used to edit an existing theme.
 *
 * Returned with custom widgets attached for color_groups and block_themes.
 */
export function editSchema(schema: JsonSchema): JsonSchema {
  return enhanceThemeSchemaWidgets(schema);
}

/**
 * The schema used to create a theme: the edit schema plus a required `id`.
 *
 * The id is not part of `ISCVLTThemeDefinition` — it lives in the registry
 * record *prefix* — so it has to be added here rather than served with the
 * schema.
 */
export function addSchema(schema: JsonSchema): JsonSchema {
  const base = enhanceThemeSchemaWidgets(schema);
  const fieldsets = base.fieldsets?.length
    ? base.fieldsets.map((fieldset, index) =>
        index === 0
          ? { ...fieldset, fields: ['id', ...fieldset.fields] }
          : fieldset,
      )
    : [
        {
          id: 'default',
          title: 'Default',
          fields: ['id', ...Object.keys(base.properties)],
        },
      ];

  return {
    ...base,
    properties: {
      id: {
        title: 'Id',
        description:
          'Short identifier, used in the registry. Lowercase letters, ' +
          'digits and dashes only; it cannot be changed later.',
        type: 'string',
      },
      ...base.properties,
    },
    required: ['id', ...(base.required ?? [])],
    fieldsets,
  };
}

/**
 * Split a submitted form into the id and the field values.
 *
 * `@id` is dropped: the backend ignores it on write, and echoing it back would
 * suggest a theme can be renamed in place, which it cannot.
 */
export function splitFormData(formData: Record<string, unknown>): {
  id: string;
  values: Record<string, unknown>;
} {
  const { id, '@id': _atId, ...values } = formData ?? {};
  return { id: String(id ?? ''), values };
}

/**
 * Seed an add form from an existing theme.
 *
 * Copies the settings and the description, but not the identity: the id must
 * be new, and a name carried over would produce two themes that look alike in
 * every listing. The name is suffixed instead, so the copy is recognisable and
 * still easy to rename.
 */
export function cloneThemeFormData(theme: ThemeItem): Record<string, unknown> {
  const { '@id': _atId, id: _id, name, ...rest } = theme;
  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(rest)) {
    if (!LEGACY_THEME_FIELDS.has(key)) {
      cleaned[key] = val;
    }
  }
  return {
    ...cleaned,
    ...(name ? { name: `${name} (copy)` } : {}),
  };
}

/** Validation message for a proposed new id, or `null` when it is usable. */
export function validateNewThemeId(
  themeId: string,
  existing: string[],
): string | null {
  if (!themeId) return 'An id is required.';
  if (!isValidThemeId(themeId)) {
    return 'Use lowercase letters, digits and dashes, with no dots.';
  }
  if (existing.includes(themeId)) return 'A theme with this id already exists.';
  return null;
}

/** The API failure shape Volto stores under `controlpanels.get.error`. */
export type ApiError = {
  status?: number;
  response?: { status?: number };
} | null;

/**
 * Whether an API failure means "you may not see this".
 *
 * `plone.restapi` answers 401 both for an anonymous visitor and for a logged-in
 * user without the permission, so a token on its own never settles the
 * question — only the response does. 403 is accepted too, for a front-end
 * server that rewrites the status.
 */
export function isUnauthorizedError(error: ApiError | undefined): boolean {
  const status = error?.status ?? error?.response?.status;
  return status === 401 || status === 403;
}
