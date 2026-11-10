import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '../..');

function readThemeFile(relPath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf8');
}

describe('Slider Block SCSS', () => {
  it('defines aspect-ratio and cover fit for highlight images', () => {
    const scss = readThemeFile('theme/blocks/_slider.scss');

    expect(scss).toContain('.highlight-image-wrapper');
    expect(scss).toContain(
      'aspect-ratio: var(--slider-images-aspect-ratio, 16 / 9);',
    );
    expect(scss).toContain('object-fit: cover;');
  });

  it('provides compact-slider mixin for embedded grids', () => {
    const scss = readThemeFile('theme/blocks/_slider.scss');

    expect(scss).toContain('@mixin compact-slider');
    expect(scss).toContain('container-type: inline-size;');
    expect(scss).toContain('@include compact-slider;');
  });

  it('styles title and description on standalone slider flag', () => {
    const scss = readThemeFile('theme/blocks/_slider.scss');

    expect(scss).toContain('background: rgba(0, 0, 0, 0.75) !important;');
    expect(scss).toContain('color: #fff !important;');
  });

  it('delegates borders to slider viewport for all sliders', () => {
    const bordersScss = readThemeFile('theme/blocks/_borders.scss');

    expect(bordersScss).toContain(".block.slider[style*='--cardBorderWidth']");
    expect(bordersScss).toContain('.slider-viewport');
  });

  it('customizes Slider View to pass through style props for border and theme system', () => {
    const viewFile = readThemeFile(
      'customizations/@kitconcept/volto-slider-block/components/View.jsx',
    );

    expect(viewFile).toContain('...style');
    expect(viewFile).toContain('--slider-container-width');
  });

  it('resets title inside accordion to prevent Semantic UI white box contamination', () => {
    const accordionScss = readThemeFile('theme/blocks/_accordion.scss');

    expect(accordionScss).toContain('.block.slider,');
    expect(accordionScss).toContain('.teaser-item-title');
    expect(accordionScss).toContain('background: transparent !important;');
  });
});
