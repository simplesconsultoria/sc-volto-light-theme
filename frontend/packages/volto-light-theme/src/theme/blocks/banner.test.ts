import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '../..');

function readThemeFile(relPath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf8');
}

describe('Banner Block SCSS', () => {
  it('applies padding and vertical center alignment on the banner text', () => {
    const scss = readThemeFile('theme/blocks/_banner.scss');

    expect(scss).toContain('display: flex;');
    expect(scss).toContain('justify-content: center');
    expect(scss).toContain('align-items: flex-start');
    expect(scss).toContain('text-align: left');
    expect(scss).toContain('clamp(1.5rem, 5vw, 3.5rem)');
    expect(scss).toContain('margin-right: auto !important;');
    expect(scss).toContain('margin-left: 0 !important;');
  });

  it('keeps text aligned to the left on full-width banners', () => {
    const scss = readThemeFile('theme/blocks/_banner.scss');
    expect(scss).toContain('.block.banner.has--block-width--full');
    expect(scss).toContain('align-items: flex-start !important;');
    expect(scss).toContain('margin-left: 0 !important;');
  });

  it('scales typography and padding down inside accordions and container blocks', () => {
    const scss = readThemeFile('theme/blocks/_banner.scss');

    expect(scss).toContain('.accordion-block');
    expect(scss).toContain('.ui.styled.accordion');
    expect(scss).toContain('grid-template-rows: minmax(180px, auto);');
    expect(scss).toContain('font-size: 1.25rem !important;');
    expect(scss).toContain('padding: 1.25rem 1.5rem;');
  });

  it('supports small, medium, and large height levels in view and edit modes', () => {
    const scss = readThemeFile('theme/blocks/_banner.scss');

    expect(scss).toContain('min-height: 200px;');
    expect(scss).toContain('grid-template-rows: 200px');
    expect(scss).toContain('min-height: 320px;');
    expect(scss).toContain('grid-template-rows: 320px');
    expect(scss).toContain('min-height: 480px;');
    expect(scss).toContain('grid-template-rows: 480px');
    expect(scss).toContain("[class*='block-editor-banner'].s");
    expect(scss).toContain("[class*='block-editor-banner'].m");
    expect(scss).toContain("[class*='block-editor-banner'].l");
  });

  it('is imported in _main.scss', () => {
    const mainScss = readThemeFile('theme/_main.scss');
    expect(mainScss).toContain("@import 'blocks/banner';");
  });
});
