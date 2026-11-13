import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guards where the `@plonegovbr/volto-social-media` icon colours are set.
 *
 * The add-on paints its icons with `--social-network-icon-color-main` and
 * `-hover`, defaulting to `#000` on `:root`. When this theme overrode them on
 * `:root` with the footer's foreground (white), a Follow Us block in the page
 * body rendered white icons on a white background. The override belongs on the
 * surfaces painted with the secondary colour only.
 */

const THEME_DIR = path.resolve(__dirname, '..');
const ICON_VARS = /--social-network-icon-color-(main|hover)\s*:/;

/** All SCSS files under the theme directory, relative to it. */
function scssFiles(dir: string = THEME_DIR): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return scssFiles(full);
    return entry.name.endsWith('.scss') ? [path.relative(THEME_DIR, full)] : [];
  });
}

/** The bodies of every top-level `:root { … }` block in a stylesheet. */
function rootBlocks(source: string): string[] {
  const blocks: string[] = [];
  const opener = /(^|\n)\s*:root\s*\{/g;
  while (opener.exec(source) !== null) {
    let depth = 1;
    let i = opener.lastIndex;
    while (i < source.length && depth > 0) {
      if (source[i] === '{') depth += 1;
      if (source[i] === '}') depth -= 1;
      i += 1;
    }
    blocks.push(source.slice(opener.lastIndex, i - 1));
  }
  return blocks;
}

describe('volto-social-media icon colours', () => {
  it('are not overridden on :root anywhere in the theme', () => {
    const offenders = scssFiles().filter((file) =>
      rootBlocks(fs.readFileSync(path.join(THEME_DIR, file), 'utf8')).some(
        (block) => ICON_VARS.test(block),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it('are set only in addons/_social_media.scss', () => {
    const declaring = scssFiles().filter((file) =>
      ICON_VARS.test(fs.readFileSync(path.join(THEME_DIR, file), 'utf8')),
    );
    expect(declaring).toEqual([path.join('addons', '_social_media.scss')]);
  });

  it('are scoped to the header bar, mobile tools and footer', () => {
    const source = fs.readFileSync(
      path.join(THEME_DIR, 'addons', '_social_media.scss'),
      'utf8',
    );
    expect(source).toMatch(/\.header-bar-wrapper,\s*\.mobile-tools-menu\s*\{/);
    expect(source).toMatch(/#footer \.post-footer\s*\{/);
  });

  it('is imported by the theme', () => {
    const main = fs.readFileSync(path.join(THEME_DIR, '_main.scss'), 'utf8');
    expect(main).toMatch(/@import 'addons\/social_media';/);
  });
});
