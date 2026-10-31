import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '../..');

function readThemeFile(relPath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf-8');
}

describe('Introduction and Separator Block Width & Container Integration', () => {
  it('Introduction SCSS: defines width system for block-container and neutralizes margins inside containers', () => {
    const scss = readThemeFile('theme/blocks/_introduction.scss');

    // View mode width handling
    expect(scss).toContain('.block.introduction');
    expect(scss).toContain('.has--block-width--narrow');
    expect(scss).toContain('.has--block-width--layout');
    expect(scss).toContain('.has--block-width--full');

    // Container margin reset (customGrid, column, contained)
    expect(scss).toContain('.custom-grid-column');
    expect(scss).toContain('margin-right: 0 !important;');
    expect(scss).toContain('margin-left: 0 !important;');
    expect(scss).toContain('max-width: 100% !important;');

    // Edit mode overrides
    expect(scss).toContain('#page-edit');
    expect(scss).toContain('.block-editor-introduction');
    expect(scss).toContain('.slate-editor');
  });

  it('Separator SCSS: resets lateral margins inside columns and contained layouts', () => {
    const scss = readThemeFile('theme/blocks/_separator.scss');

    expect(scss).toContain('.block.separator');
    expect(scss).toContain('.custom-grid-column');
    expect(scss).toContain('margin-right: 0 !important;');
    expect(scss).toContain('margin-left: 0 !important;');
  });

  it('_blockWidth SCSS: excludes contained and custom-grid columns from edit container queries and enforces 0 lateral margins', () => {
    const scss = readThemeFile('theme/blocks/_blockWidth.scss');

    expect(scss).toContain(
      ":not(.custom-grid-column [class*='block-editor-'])",
    );
    expect(scss).toContain('.custom-grid-column,');
    expect(scss).toContain('.block-container');
  });

  it('_main SCSS: imports introduction and separator block styles', () => {
    const scss = readThemeFile('theme/_main.scss');

    expect(scss).toContain("@import 'blocks/introduction';");
    expect(scss).toContain("@import 'blocks/separator';");
  });
});
