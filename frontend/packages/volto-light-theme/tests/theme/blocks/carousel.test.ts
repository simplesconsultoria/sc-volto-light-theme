import { describe, it, expect } from 'vitest';
import { readSource as readThemeFile } from '../../support/source';

describe('Carousel Block SCSS', () => {
  it('sizes direct children of carousel-container so nested cards are not double-shrunk', () => {
    const scss = readThemeFile('theme/blocks/_carousel.scss');

    expect(scss).toContain('.carousel-wrapper');
    expect(scss).toContain('.carousel-container');
    expect(scss).toContain('&.one .carousel-container > *');
    expect(scss).toContain('&.two .carousel-container > *');
    expect(scss).toContain('&.three .carousel-container > *');
    expect(scss).toContain('&.four .carousel-container > *');
    expect(scss).toContain('flex: 0 0 100%');
    expect(scss).toContain('flex: 0 0 50%');
    expect(scss).toContain('flex: 0 0 calc(100% / 3)');
    expect(scss).toContain('flex: 0 0 25%');
  });

  it('formats card image wrapper with aspect-ratio 16/9 and cover fit', () => {
    const scss = readThemeFile('theme/blocks/_carousel.scss');

    expect(scss).toContain('aspect-ratio: 16 / 9;');
    expect(scss).toContain('object-fit: cover !important;');
  });

  it('provides compact-carousel container queries for embedded grids', () => {
    const scss = readThemeFile('theme/blocks/_carousel.scss');

    expect(scss).toContain('@mixin compact-carousel');
    expect(scss).toContain('@container (max-width: 479px)');
    expect(scss).toContain('@container (min-width: 480px)');
    expect(scss).toContain('.carousel-container > *');
  });

  it('delegates custom borders to individual cards in borders system', () => {
    const bordersScss = readThemeFile('theme/blocks/_borders.scss');

    expect(bordersScss).toContain(
      ".block.carousel[style*='--cardBorderWidth']",
    );
    expect(bordersScss).toContain('.carousel-container .card');
  });
});
