/**
 * Types mirroring what the backend actually sends.
 *
 * The shapes here follow `ISCVLTThemeDefinition` and the adapters in
 * `sc.voltolighttheme.serializers`; keep them in step with those, and with the
 * tests in `tests/serializers/test_fields.py` which pin the payload.
 */

/**
 * The style-bearing settings of a theme — exactly what `theme_settings()`
 * returns and what `ThemeFieldSerializer` puts under `value`.
 *
 * Every key becomes a CSS custom property, so metadata is deliberately absent.
 * All fields are optional: they are `required=False` on the backend, and a
 * field with no registry record is omitted rather than sent as `null`.
 *
 * These are colours today; the backend defines settings by *excluding*
 * metadata, so a future style variable lands here without a shape change.
 * Anything not matching a hex colour is dropped when the stylesheet is built —
 * see `HEX_COLOR` in `helpers/themeStyles.ts`, which is the one place to widen
 * when a non-colour setting arrives.
 */
export type ThemeSettings = {
  primary_color_light?: string;
  primary_color_dark?: string;
  primary_foreground_color_light?: string;
  primary_foreground_color_dark?: string;
  primary_low_foreground_color_light?: string;
  primary_low_foreground_color_dark?: string;
  primary_accent_color_light?: string;
  primary_accent_color_dark?: string;

  secondary_color_light?: string;
  secondary_color_dark?: string;
  secondary_foreground_color_light?: string;
  secondary_foreground_color_dark?: string;
  secondary_low_foreground_color_light?: string;
  secondary_low_foreground_color_dark?: string;
  secondary_accent_color_light?: string;
  secondary_accent_color_dark?: string;

  accent_color_light?: string;
  accent_color_dark?: string;
  accent_foreground_color_light?: string;
  accent_foreground_color_dark?: string;
  accent_low_foreground_color_light?: string;
  accent_low_foreground_color_dark?: string;
  accent_accent_color_light?: string;
  accent_accent_color_dark?: string;

  neutral_color_light?: string;
  neutral_color_dark?: string;
  neutral_foreground_color_light?: string;
  neutral_foreground_color_dark?: string;
  neutral_low_foreground_color_light?: string;
  neutral_low_foreground_color_dark?: string;
  neutral_accent_color_light?: string;
  neutral_accent_color_dark?: string;

  event_color_light?: string;
  event_color_dark?: string;
  file_color_light?: string;
  file_color_dark?: string;
  image_color_light?: string;
  image_color_dark?: string;

  header_foreground_color?: string;
};

/**
 * A complete theme record, as the control panel reads and writes it — the
 * colours plus the descriptive fields `theme_settings()` excludes.
 *
 * Named `SiteTheme` rather than `ThemeDefinition` to keep it distinct from the
 * block-styling themes in `config/blocks.ts`, which are a different concept.
 */
export type SiteTheme = ThemeSettings & {
  name?: string;
  description?: string;
};

/**
 * The `theme` field of `sc.voltolighttheme.themeselector`, as serialized.
 *
 * `token` and `title` are the contract every Volto choice widget relies on:
 * `normalizeSingleSelectOption` reads `token` to mark the selected option, and
 * `ChoiceFieldDeserializer` reads it back off an untouched form. The resolved
 * colours ride under `value`.
 *
 * `null` when no theme is selected; for a theme deleted while still selected,
 * `token` survives and `value` is empty.
 */
export type SerializedTheme = {
  token?: string;
  title?: string;
  value?: ThemeSettings;
};

/** One theme as returned by `@controlpanels/themes`. */
export type ThemeItem = SiteTheme & {
  '@id': string;
  id: string;
};

/** A JSON schema property, as `plone.restapi` renders it. */
export type JsonSchemaProperty = {
  title?: string;
  description?: string;
  type?: string;
  widget?: string;
  factory?: string;
  choices?: Array<[string, string]>;
  vocabulary?: { '@id': string };
};

/** The JSON schema of `ISCVLTThemeDefinition`. */
export type JsonSchema = {
  type?: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  fieldsets?: Array<{ id: string; title: string; fields: string[] }>;
};

/**
 * The `@controlpanels/themes` payload.
 *
 * A collection rather than the single `data` object a registry control panel
 * returns — see `ThemesControlpanelSerializeToJson` on the backend.
 */
export type ThemesControlpanelData = {
  '@id': string;
  title?: string;
  group?: string;
  schema?: JsonSchema;
  items?: ThemeItem[];
  items_total?: number;
};
