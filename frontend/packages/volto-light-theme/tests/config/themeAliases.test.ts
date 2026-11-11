import { describe, it, expect } from 'vitest';
import install from '@simplesconsultoria/volto-light-theme/config/blocks';
import {
  LEGACY_THEME_ALIASES,
  resolveBlockTheme,
  resolveThemeAlias,
} from '@simplesconsultoria/volto-light-theme/config/blockThemes';
import { parseThemeValue } from '@simplesconsultoria/volto-light-theme/components/Widgets/BlockThemeWidget';

/**
 * Blocks saved with plain VLT's `grey` theme (grey band, white cards) keep
 * that look without editing the content: `grey` means a `secondary` ground
 * under `primary` cards.
 */
describe('legacy theme alias: grey', () => {
  it('maps grey to a secondary ground with primary cards', () => {
    expect(LEGACY_THEME_ALIASES.grey).toBe('custom-secondary-primary');
    expect(resolveThemeAlias('grey')).toBe('custom-secondary-primary');
    expect(resolveThemeAlias('default')).toBe('default');
    expect(resolveThemeAlias(undefined)).toBeUndefined();
  });

  it('resolves a block saved with grey', () => {
    const resolved = resolveBlockTheme({ theme: 'grey' });
    expect(resolved.backColorGroup).toBe('secondary');
    expect(resolved.frontColorGroup).toBe('primary');
    expect(resolved.className).toContain('has-back-colorgroup-secondary');
    expect(String((resolved.style as any)['--theme-color'])).toContain(
      '--colorgroup-secondary-bg',
    );
  });

  it('also reads grey from styles.theme', () => {
    const resolved = resolveBlockTheme({ styles: { theme: 'grey' } } as any);
    expect(resolved.backColorGroup).toBe('secondary');
  });

  it('shows grey in the widget as the equivalent custom theme', () => {
    expect(parseThemeValue('grey')).toEqual({
      themeId: 'custom',
      back: 'secondary',
      front: 'primary',
    });
  });

  it('paints the block group band: config.blocks.themes answers for grey', () => {
    const config: any = {
      blocks: { themes: [], widths: [], blocksConfig: {} },
      settings: {},
    };
    install(config);
    const definition = config.blocks.themes.find(
      (theme: any) => theme.name === 'grey',
    );
    expect(definition).toBeDefined();
    expect(definition.style['--theme-color']).toContain(
      '--colorgroup-secondary-bg',
    );
    expect(definition.style['--theme-high-contrast-color']).toContain(
      '--colorgroup-primary-bg',
    );
  });
});
