import { describe, it, expect } from 'vitest';
import install from '@simplesconsultoria/volto-light-theme/config/blocks';
import registry from '@plone/volto/registry';
import {
  COLOR_GROUP_ID_PATTERN,
  LEGACY_THEME_ALIASES,
  parseCustomTheme,
  resolveBlockTheme,
  resolveThemeAlias,
} from '@simplesconsultoria/volto-light-theme/config/blockThemes';
import { cleanGroupId } from '@simplesconsultoria/volto-light-theme/components/Widgets/ColorGroups/NewColorGroupForm';
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

describe('legacy theme alias: a project theme of the same name', () => {
  it('keeps a grey defined in config.blocks.themes', () => {
    const blocks = (registry as any).blocks;
    const previous = blocks.themes;
    blocks.themes = [{ name: 'grey', label: 'Lavender', style: {} }];
    try {
      expect(resolveThemeAlias('grey')).toBe('grey');
      expect(parseThemeValue('grey')).toEqual({ themeId: 'grey' });
    } finally {
      blocks.themes = previous;
    }
  });

  it('keeps a grey defined in config.blocks.blockThemes', () => {
    const blocks = (registry as any).blocks;
    const previous = blocks.blockThemes;
    blocks.blockThemes = { ...previous, grey: { id: 'grey', name: 'Grey' } };
    try {
      expect(resolveThemeAlias('grey')).toBe('grey');
    } finally {
      blocks.blockThemes = previous;
    }
  });
});

describe('parseCustomTheme', () => {
  it('splits a custom theme name into its groups', () => {
    expect(parseCustomTheme('custom-secondary-primary')).toEqual({
      back: 'secondary',
      front: 'primary',
    });
  });

  it('reads group ids with underscores', () => {
    expect(parseCustomTheme('custom-my_brand-neutral')).toEqual({
      back: 'my_brand',
      front: 'neutral',
    });
  });

  it.each([['default'], ['custom'], ['custom-a-b-c'], [undefined], [42]])(
    'rejects %s',
    (name) => {
      expect(parseCustomTheme(name)).toBeNull();
    },
  );

  it('resolves a custom theme built from an underscored group', () => {
    const resolved = resolveBlockTheme({ theme: 'custom-my_brand-neutral' });
    expect(resolved.backColorGroup).toBe('my_brand');
    expect(resolved.frontColorGroup).toBe('neutral');
  });
});

describe('cleanGroupId', () => {
  it('never produces a dash', () => {
    expect(cleanGroupId(' My Brand-Color ')).toBe('my_brand_color');
    expect(COLOR_GROUP_ID_PATTERN.test(cleanGroupId('My Brand'))).toBe(true);
  });
});
