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
 * The schema used to edit an existing theme.
 *
 * Returned as-is; it is the schema of `ISCVLTThemeDefinition`, which already
 * carries the `colorPicker` widgets contributed by the backend.
 */
export function editSchema(schema: JsonSchema): JsonSchema {
  return schema;
}

/**
 * The schema used to create a theme: the edit schema plus a required `id`.
 *
 * The id is not part of `ISCVLTThemeDefinition` — it lives in the registry
 * record *prefix* — so it has to be added here rather than served with the
 * schema.
 */
export function addSchema(schema: JsonSchema): JsonSchema {
  const fieldsets = schema.fieldsets?.length
    ? schema.fieldsets.map((fieldset, index) =>
        index === 0
          ? { ...fieldset, fields: ['id', ...fieldset.fields] }
          : fieldset,
      )
    : [
        {
          id: 'default',
          title: 'Default',
          fields: ['id', ...Object.keys(schema.properties)],
        },
      ];

  return {
    ...schema,
    properties: {
      id: {
        title: 'Id',
        description:
          'Short identifier, used in the registry. Lowercase letters, ' +
          'digits and dashes only; it cannot be changed later.',
        type: 'string',
      },
      ...schema.properties,
    },
    required: ['id', ...(schema.required ?? [])],
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
  return {
    ...rest,
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
