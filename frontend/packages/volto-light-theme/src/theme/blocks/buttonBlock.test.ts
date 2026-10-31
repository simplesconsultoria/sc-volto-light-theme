import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '../..');

function readThemeFile(relPath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf8');
}

describe('Button Block SCSS - Small Divs and Grid Adaptation', () => {
  it('defines container-type inline-size and display inline-flex for unified button box', () => {
    const scss = readThemeFile('theme/blocks/_buttonBlock.scss');

    expect(scss).toContain('container-type: inline-size;');
    expect(scss).toContain('display: inline-flex;');
    expect(scss).toContain('overflow-wrap: break-word;');
    expect(scss).toContain('max-width: 100%;');
  });

  it('provides adaptive padding for small containers via container queries', () => {
    const scss = readThemeFile('theme/blocks/_buttonBlock.scss');

    expect(scss).toContain('@container (max-width: 260px)');
    expect(scss).toContain('@container (max-width: 200px)');
    expect(scss).toContain('@container (max-width: 160px)');
  });

  it('resets margins and adapts width inside columns and contained blocks', () => {
    const scss = readThemeFile('theme/blocks/_buttonBlock.scss');

    expect(scss).toContain('.custom-grid-column');
    expect(scss).toContain('.block.gridBlock .column');
    expect(scss).toContain('.block.contained');
    expect(scss).toContain('.layout-1-4 .custom-grid-column:first-child');
  });

  it('supports theme colors with hover transition', () => {
    const scss = readThemeFile('theme/blocks/_buttonBlock.scss');

    expect(scss).toContain('var(--theme-foreground-color');
    expect(scss).toContain('var(--theme-color');
  });
});
