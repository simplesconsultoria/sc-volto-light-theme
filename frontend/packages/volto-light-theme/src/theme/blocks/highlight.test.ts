import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '../..');

function readThemeFile(relPath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf-8');
}

describe('Highlight Block Integration & Styling', () => {
  it('_highlight.scss: provides horizontal padding so text does not touch card borders', () => {
    const scss = readThemeFile('theme/blocks/_highlight.scss');

    expect(scss).toContain('.block.highlight');
    expect(scss).toContain('.highlight-description');
    expect(scss).toContain('padding-right: $spacing-medium !important;');
    expect(scss).toContain('padding-left: $spacing-medium !important;');
    expect(scss).toContain('@container (max-width: 768px)');
    expect(scss).toContain('padding-right: $spacing-small !important;');
    expect(scss).toContain('padding-left: $spacing-small !important;');
    expect(scss).toContain('.teaser-item');
    expect(scss).toContain('overflow: hidden;');
  });

  it('_borders.scss: applies card borders to teaser-item / container and excludes from generic fallback', () => {
    const scss = readThemeFile('theme/blocks/_borders.scss');

    expect(scss).toContain(".block.highlight[style*='--cardBorderWidth']");
    expect(scss).toContain('.teaser-item');
    expect(scss).toContain('@include apply-block-border;');

    // Must be excluded from generic fallback
    expect(scss).toContain('.highlight,');
    expect(scss).toContain('.block-highlight,');
  });

  it('_accordion.scss: resets highlight title from Semantic UI accordion contamination and sizes proportionally', () => {
    const scss = readThemeFile('theme/blocks/_accordion.scss');

    // Title reset list includes highlight
    expect(scss).toContain('.block.highlight,');
    expect(scss).toContain('.block-highlight,');

    // Inside accordion panel, prominent title size is preserved
    expect(scss).toContain(
      '.block.highlight,\n      .block-highlight,\n      .block-editor-highlight',
    );
    expect(scss).toContain('clamp(1.75rem, 3.5vw, 2.5rem)');
  });

  it('_main.scss: imports highlight stylesheet', () => {
    const scss = readThemeFile('theme/_main.scss');

    expect(scss).toContain("@import 'blocks/highlight';");
  });
});
