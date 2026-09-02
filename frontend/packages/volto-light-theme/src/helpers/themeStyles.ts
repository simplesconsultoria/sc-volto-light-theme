/**
 * Turn a theme's settings into CSS custom properties.
 *
 * `theme/_root.scss` already reads these from custom properties, so applying a
 * theme is only a matter of overriding the right ones.
 */

import type { SerializedTheme, ThemeSettings } from '../types/theme';

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
  const properties = themeCustomProperties(settings);
  const declarations = Object.entries(properties)
    .map(([variable, value]) => `  ${variable}: ${value};`)
    .join('\n');

  return declarations ? `${selector} {\n${declarations}\n}` : '';
}
