import { describe, it, expect } from 'vitest';
import { readSource as readThemeFile } from '../../support/source';

describe('Logos Block SCSS', () => {
  it('applies border to individual logo items, not the outer container', () => {
    const scss = readThemeFile('theme/blocks/_logos.scss');

    expect(scss).toContain('.block.logos,');
    expect(scss).toContain("[class*='block-editor-logos']");
    expect(scss).toContain("&[style*='--cardBorderWidth']");
    expect(scss).toContain('.item,');
    expect(scss).toContain('.logo-item');
    expect(scss).toContain('@include apply-block-border;');
    expect(scss).toContain('border: none !important;');
  });

  it('resets inner container to 100% to adapt to the block width system', () => {
    const scss = readThemeFile('theme/blocks/_logos.scss');

    expect(scss).toContain('.ui.container,');
    expect(scss).toContain('width: 100% !important;');
    expect(scss).toContain('max-width: 100% !important;');
  });

  it('is imported in _main.scss', () => {
    const mainScss = readThemeFile('theme/_main.scss');
    expect(mainScss).toContain("@import 'blocks/logos';");
  });

  it('has dedicated exclusion and item delegation in _borders.scss', () => {
    const bordersScss = readThemeFile('theme/blocks/_borders.scss');
    expect(bordersScss).toContain(".block.logos[style*='--cardBorderWidth']");
    expect(bordersScss).toContain(
      "#page-edit [class*='block-editor-logos'][style*='--cardBorderWidth']",
    );
    expect(bordersScss).toContain('.item,');
    expect(bordersScss).toContain('.logo-item');
  });

  it('does not apply nested container margins to ul.logos-container in _blockWidth.scss', () => {
    const widthScss = readThemeFile('theme/blocks/_blockWidth.scss');
    expect(widthScss).not.toContain('.logos-container,');
    expect(widthScss).not.toContain('ul.logos-container');
    expect(widthScss).toContain('container-name: page-document;');
  });

  it('makes logo items hug image dimensions with transparent background', () => {
    const scss = readThemeFile('theme/blocks/_logos.scss');
    expect(scss).toContain('width: fit-content;');
    expect(scss).toContain('background-color: transparent !important;');
    expect(scss).toContain('justify-items: center;');
  });

  it('excludes heroBlock and customGrid from outer block width margins in _blockWidth.scss', () => {
    const widthScss = readThemeFile('theme/blocks/_blockWidth.scss');
    expect(widthScss).toContain(
      ':not(.heroBlock):not(.block-editor-heroBlock)',
    );
    expect(widthScss).toContain(
      '@container page-document (max-width: #{$width + 2 * $horizontal-space-small-screens})',
    );
  });
});
