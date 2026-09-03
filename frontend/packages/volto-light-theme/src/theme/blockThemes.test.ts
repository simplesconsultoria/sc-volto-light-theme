import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { createThemeDefinition } from '../config/blocks';

/**
 * Guards the contract between `createThemeDefinition` and `_root.scss`.
 *
 * The factory maps 14 semantic `--theme-*` properties onto
 * `--block-theme-{name}-*` tokens, but nothing makes the stylesheet define
 * them. When four of them were missing, the failure was silent: a `var()` with
 * no definition and no fallback is *invalid at computed-value time*, so the
 * whole declaration is dropped. That took out six focus outlines in
 * `_listing.scss` — `outline: 2px solid var(--theme-top-high-contrast-foreground-color)`
 * simply never rendered, leaving keyboard focus invisible on listing cards.
 *
 * Nothing else catches this. There is no typecheck in CI, stylelint does not
 * resolve custom properties across files, and a story renders happily without
 * an outline. These tests read the SCSS as text for that reason: the point is
 * to check what the stylesheet *declares*, which only the source can answer.
 */

const THEME_DIR = __dirname;

/** The themes registered in `config/blocks.ts`. */
const THEMES = ['default', 'brand'];

function readTheme(file: string): string {
  return fs.readFileSync(path.join(THEME_DIR, file), 'utf8');
}

/**
 * Every `--block-theme-*` custom property declared in `_root.scss`'s **`:root`**
 * block.
 *
 * Scoped to `:root` deliberately. `[data-theme='high-contrast']` redeclares
 * several of these, so scanning the whole file would accept a token that exists
 * *only* in high-contrast mode and is undefined in light and dark — which is
 * exactly what `--block-theme-brand-border-width` did.
 */
function declaredTokens(): Set<string> {
  const source = readTheme('_root.scss');
  const start = source.indexOf(':root {');
  expect(start, '_root.scss has no :root block').toBeGreaterThanOrEqual(0);
  // the block ends at the first closing brace in column 0
  const end = source.indexOf('\n}', start);
  const root = source.slice(start, end);

  return new Set(
    [...root.matchAll(/^\s*(--block-theme-[a-z-]+):/gm)].map((m) => m[1]),
  );
}

/** Every `--theme-*` property referenced by any stylesheet in `src/theme`. */
function referencedThemeProps(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.scss')) {
        const text = fs.readFileSync(full, 'utf8');
        for (const m of text.matchAll(/var\((--theme-[a-z-]+)/g)) {
          found.set(m[1], [...(found.get(m[1]) ?? []), entry.name]);
        }
      }
    }
  };
  walk(THEME_DIR);
  return found;
}

describe('block theme token contract', () => {
  const declared = declaredTokens();

  it.each(THEMES)(
    'theme "%s" defines every property the factory maps',
    (theme) => {
      const mapped = createThemeDefinition(theme, theme).style;
      const missing = Object.values(mapped)
        .map((value) => value.match(/var\((--block-theme-[a-z-]+)\)/)?.[1])
        .filter((token): token is string => Boolean(token))
        .filter((token) => !declared.has(token));

      expect(
        missing,
        `_root.scss does not declare ${missing.join(', ')} — every ` +
          `var() reading them is dropped as invalid at computed-value time`,
      ).toEqual([]);
    },
  );

  it('maps exactly the 14 documented properties', () => {
    expect(
      Object.keys(createThemeDefinition('default', 'x').style),
    ).toHaveLength(14);
  });

  it('maps every --theme-* property the stylesheets reference', () => {
    const mapped = new Set(
      Object.keys(createThemeDefinition('default', 'default').style),
    );
    const unmapped = [...referencedThemeProps().entries()]
      .filter(([prop]) => !mapped.has(prop))
      .map(([prop, files]) => `${prop} (${[...new Set(files)].join(', ')})`);

    expect(
      unmapped,
      'these are read by a stylesheet but no theme supplies them, so the ' +
        'declarations using them are dropped',
    ).toEqual([]);
  });

  it('keeps the focus outlines in _listing.scss resolvable', () => {
    // The specific regression: these six had no fallback, so an undefined
    // token removed the outline entirely rather than degrading it.
    const listing = readTheme(path.join('blocks', '_listing.scss'));
    const outlines = [
      ...listing.matchAll(/outline:[^;]*var\((--theme-[a-z-]+)\)/g),
    ].map((m) => m[1]);

    expect(outlines.length).toBeGreaterThan(0);
    const mapped = new Set(
      Object.keys(createThemeDefinition('default', 'default').style),
    );
    for (const prop of outlines) {
      expect(mapped.has(prop), `${prop} is not mapped by any theme`).toBe(true);
    }
  });
});
