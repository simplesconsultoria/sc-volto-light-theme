/**
 * The block-theme factory.
 *
 * Kept apart from `config/blocks` deliberately: the mapping has no dependency on
 * block registration, and importing it from there pulls in every registered block.
 * `_root.scss` must declare a `--block-theme-{name}-*` token for each property this
 * maps — a `var()` with no definition and no fallback is invalid at computed-value
 * time, so the whole declaration is dropped. `theme/blockThemes.test.ts` guards it.
 */

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
