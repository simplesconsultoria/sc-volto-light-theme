import { describe, it, expect } from 'vitest';
import { readSource as readThemeFile } from '../../support/source';

describe('Image and MainImageBlock Unified Styling SCSS', () => {
  it('unifies base classes and media size variables for both Image and MainImageBlock', () => {
    const scss = readThemeFile('theme/blocks/_image.scss');

    expect(scss).toContain('.block.image');
    expect(scss).toContain('.block.mainImageBlock');
    expect(scss).toContain('.block-editor-image');
    expect(scss).toContain('.block-editor-mainImageBlock');
    expect(scss).toContain('--size-small: 220px;');
    expect(scss).toContain('--size-medium: 300px;');
    expect(scss).toMatch(
      /--size-large:\s*calc\(\s*var\(--block-width,\s*var\(--default-container-width\)\)\s*\/\s*2\s*-\s*10px\s*\);/,
    );
  });

  it('guarantees --block-width and max-width overrides based on has--block-width--* classes with !important', () => {
    const scss = readThemeFile('theme/blocks/_image.scss');

    expect(scss).toContain(
      '--block-width: var(--narrow-container-width) !important;',
    );
    expect(scss).toContain(
      'max-width: var(--narrow-container-width) !important;',
    );

    expect(scss).toContain(
      '--block-width: var(--default-container-width) !important;',
    );
    expect(scss).toContain(
      'max-width: var(--default-container-width) !important;',
    );

    expect(scss).toContain(
      '--block-width: var(--layout-container-width) !important;',
    );
    expect(scss).toContain(
      'max-width: var(--layout-container-width) !important;',
    );

    expect(scss).toContain('--block-width: 100% !important;');
    expect(scss).toContain('max-width: 100% !important;');
  });

  it('applies height: 0 exclusively in #page-document desktop view mode', () => {
    const scss = readThemeFile('theme/blocks/_image.scss');

    expect(scss).toContain('#page-document');
    expect(scss).toContain('height: 0;');
    expect(scss).toContain("@include floated-figure('left');");
    expect(scss).toContain("@include floated-figure('right');");
  });

  it('enforces responsive float resets and height: auto on mobile', () => {
    const scss = readThemeFile('theme/blocks/_image.scss');

    expect(scss).toContain('height: auto !important;');
    expect(scss).toContain('clear: both !important;');
    expect(scss).toContain('float: none !important;');
    expect(scss).toContain('text-align: center !important;');
  });

  it('supports edit mode with container width propagation and proper margins', () => {
    const scss = readThemeFile('theme/blocks/_image.scss');

    expect(scss).toContain('#page-edit');
    expect(scss).toContain('#page-add');
    expect(scss).toContain(
      '@include adjustMarginsToEditContainer($narrow-container-width);',
    );
    expect(scss).toContain(
      '@include adjustMarginsToEditContainer($default-container-width);',
    );
    expect(scss).toContain(
      '@include adjustMarginsToEditContainer($layout-container-width);',
    );
    expect(scss).toContain('.block.inner .block .block');
    expect(scss).toContain('max-width: var(--block-width) !important;');
  });

  it('ensures contained images stretch correctly in columns and accordions', () => {
    const scss = readThemeFile('theme/blocks/_image.scss');

    expect(scss).toContain('.custom-grid-column');
    expect(scss).toContain('.block.gridBlock .column');
    expect(scss).toContain('.accordion-block .content');
    expect(scss).toContain('width: 100% !important;');
  });

  it('verifies _main.scss imports blocks/image and blocks/mainImageBlock', () => {
    const mainScss = readThemeFile('theme/_main.scss');

    expect(mainScss).toContain("@import 'blocks/image';");
    expect(mainScss).toContain("@import 'blocks/mainImageBlock';");
  });
});
