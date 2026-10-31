import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '../..');

function readThemeFile(relPath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf-8');
}

describe('SlateTable / Table Block Width & Styling Integration', () => {
  it('_table.scss: neutralizes display:grid on block-inner-container and enforces full fluid width on table', () => {
    const scss = readThemeFile('theme/blocks/_table.scss');

    // Targets slateTable wrapper and block-inner-container
    expect(scss).toContain('.block.slateTable');
    expect(scss).toContain('.block-inner-container');
    expect(scss).toContain('display: block !important;');
    expect(scss).toContain('width: 100% !important;');
    expect(scss).toContain('max-width: 100% !important;');

    // Neutralizes the spurious ::before from pastanaga that protrudes 9px without overflow-x hacks
    expect(scss).toContain('.block.slate-table::before');
    expect(scss).toContain('display: none !important;');
    expect(scss).not.toContain('overflow-x: none');

    // Enforces 100% width on slate table element
    expect(scss).toContain('table.slate-table-block');
    expect(scss).toContain('table.ui.table');

    // Edit mode overrides
    expect(scss).toContain('#page-edit');
    expect(scss).toContain('.block-editor-slateTable');

    // Reset inside columns and containers
    expect(scss).toContain('.custom-grid-column');
    expect(scss).toContain('.contained');
  });

  it('_blockWidth.scss: neutralizes spurious ::before on full width blocks without overflow-x none', () => {
    const scss = readThemeFile('theme/blocks/_blockWidth.scss');

    expect(scss).toContain('.has--block-width--full');
    expect(scss).toContain('.block::before');
    expect(scss).not.toContain('overflow-x: none');
  });

  it('_blockWidth.scss: does not apply conflicting inner margins to .slate-table-block', () => {
    const scss = readThemeFile('theme/blocks/_blockWidth.scss');

    // In the main view mode rules, .slate-table-block is not selected as inner descendant
    const viewSection = scss.split('// 3. Modo de Edição')[0];
    expect(viewSection).not.toContain('.slate-table-block,');
  });

  it('_main.scss: imports table block styles', () => {
    const scss = readThemeFile('theme/_main.scss');

    expect(scss).toContain("@import 'blocks/table';");
  });
});
