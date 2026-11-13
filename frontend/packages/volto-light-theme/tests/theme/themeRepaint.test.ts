import { describe, expect, it } from 'vitest';
import { readSource } from '../support/source';
import {
  colorGroupUtilityClasses,
  themeStyleSheet,
} from '@simplesconsultoria/volto-light-theme/helpers/themeStyles';
import { DEFAULT_COLOR_GROUPS } from '@simplesconsultoria/volto-light-theme/config/blockThemes';
import { readableTextOn } from '@simplesconsultoria/volto-light-theme/components/Widgets/ColorGroups/ColorGroupItem';

/** The `:root { ... }` block of `_root.scss`. */
function rootBlock(): string {
  const source = readSource('theme/_root.scss');
  const start = source.indexOf(':root {');
  return source.slice(start, source.indexOf('\n}', start));
}

describe('Block Theme picked in the sidebar repaints the block', () => {
  it('paints the edit wrapper of a themed block, which has no group wrapper', () => {
    const scss = readSource('theme/_globals.scss');
    expect(scss).toMatch(
      /#page-edit,\s*#page-add\s*\{\s*\[class\*='block-editor-'\]\[class\*='has--theme--'\]\s*\{\s*background-color: var\(--theme-color\);/,
    );
  });
});

describe("a Color Group's background layer reaches the site", () => {
  it.each(['default', 'alternative'])(
    'the %s theme declares its pattern token without masking the layer',
    (theme) => {
      // `none` would win over `var(--colorgroup-<back>-bg-image)` in
      // `--theme-bg-image`; `initial` keeps the token declared but empty.
      expect(rootBlock()).toContain(
        `--block-theme-${theme}-pattern-image: initial;`,
      );
    },
  );

  it('paints the layer on bands saved under the legacy `grey` name', () => {
    const css = colorGroupUtilityClasses(DEFAULT_COLOR_GROUPS);
    const rule = css.slice(css.indexOf('.has-back-colorgroup-secondary,'));
    const head = rule.slice(0, rule.indexOf('{'));
    expect(head).toContain('.blocks-group-wrapper.grey,');
    expect(head).toContain('.blocks-group-wrapper[class*="custom-secondary-"]');
    expect(rule).toContain(
      '--theme-bg-image: var(--colorgroup-secondary-bg-image, none);',
    );
  });

  it('does not give `grey` to a Color Group other than its back one', () => {
    const css = colorGroupUtilityClasses(DEFAULT_COLOR_GROUPS);
    const primary = css.slice(
      css.indexOf('.has-back-colorgroup-primary,'),
      css.indexOf('{', css.indexOf('.has-back-colorgroup-primary,')),
    );
    expect(primary).not.toContain('.grey');
  });

  it('exposes the front group layer without a site theme too', () => {
    const scss = readSource('theme/_root.scss');
    expect(scss).toMatch(
      /@each \$group in \(primary, secondary, accent, neutral\) \{\s*\.has-front-colorgroup-#\{\$group\} \{\s*--colorgroup-front-bg-image: var\(--colorgroup-#\{\$group\}-bg-image, none\);/,
    );
  });

  it('exposes the front group layer to the cards of a block', () => {
    const css = colorGroupUtilityClasses(DEFAULT_COLOR_GROUPS);
    const rule = css.slice(css.indexOf('.has-front-colorgroup-secondary {'));
    expect(rule).toContain(
      '--colorgroup-front-bg-image: var(--colorgroup-secondary-bg-image, none);',
    );
  });
});

describe('Listing grid card border', () => {
  const scss = readSource('theme/blocks/listing/_grid.scss');

  it('sets every side from one border-width shorthand', () => {
    expect(scss).toMatch(
      /border-width: var\(\s*--cardBorderWidth,\s*var\(--theme-border-width, 3px 0 0 0\)\s*\) !important;/,
    );
  });

  it('never reads the shorthand into a single side', () => {
    // `6px 0 0 0` is invalid for border-top-width, which then falls back to
    // `medium` whatever the editor picked.
    expect(scss).not.toMatch(/border-top-width: var\(\s*--cardBorderWidth/);
  });
});

describe('other borders that read the block theme border width', () => {
  // `--theme-border-width` is a `border-width` shorthand (`4px 0 0` on the
  // default theme). Inside `border`, `border-top` or a single-side width it
  // makes the declaration invalid and the border disappears.
  const SINGLE_VALUE_USE =
    /(?:border(?:-(?:top|right|bottom|left))?|border-(?:top|right|bottom|left)-width)\s*:[^;]*var\(\s*--(?:theme-border-width|cardBorderWidth)/;

  it.each([
    'theme/blocks/_eventMetadataBlock.scss',
    'theme/blocks/listing/_headline.scss',
    'theme/blocks/listing/_grid.scss',
  ])('%s only uses it as a border-width shorthand', (file) => {
    const scss = readSource(file);
    expect(scss).not.toMatch(SINGLE_VALUE_USE);
    expect(scss).toMatch(
      /border-width: var\(\s*--(theme-border-width|cardBorderWidth)/,
    );
  });
});

describe('card borders survive an undefined colour', () => {
  // `border: solid var(--cardBorderColor, var(--theme-border-color))` is
  // invalid as a whole when both variables are undefined, `solid` included:
  // a full border set in the Border widget then showed on the top side only.
  const files = [
    'theme/blocks/_teaser.scss',
    'theme/blocks/_search.scss',
    'theme/blocks/listing/_grid.scss',
    'theme/blocks/listing/_teaser.scss',
    'theme/blocks/listing/_carousel.scss',
  ];

  it.each(files)('%s sets the border style apart from its colour', (file) => {
    const scss = readSource(file);
    expect(scss).not.toMatch(
      /^\s*border:[^;]*var\(\s*--(cardBorderColor|theme-border-color)/m,
    );
    expect(scss).toContain('border-style: solid;');
  });

  it('gives the Alternative theme a border colour', () => {
    const decl = /--block-theme-alternative-border:\s*([^;]+);/.exec(
      rootBlock(),
    );
    expect(decl?.[1]).not.toMatch(/^(unset|initial|inherit)$/);
  });

  it('draws a widget border on a grid card in one colour', () => {
    const scss = readSource('theme/blocks/listing/_grid.scss');
    expect(scss).toMatch(
      /\.listing-block-container\[style\*='--cardBorderWidth'\] \.listing-item \.card \{\s*border-top-color: var\(\s*--cardBorderColor,/,
    );
  });
});

describe('Highlight description panel', () => {
  const scss = readSource('theme/blocks/_highlight.scss');

  it('lets text follow the panel instead of the block ground', () => {
    expect(scss).toMatch(
      /\.highlight-description \{\s*:is\(p, li, h2, h3, h4, h5, h6\) \{\s*color: inherit;/,
    );
  });

  it('turns the default Grey panel into the front Color Group', () => {
    expect(scss).toContain(
      '.block.highlight.has--descriptionColor--highlight-custom-color-1,',
    );
    expect(scss).toContain(
      '--descriptionColor: var(--theme-high-contrast-color, #ecebeb);',
    );
    expect(scss).toContain(
      '--descriptionColor-foreground: var(--theme-top-foreground-color, #000);',
    );
  });
});

describe('links when a site theme is applied', () => {
  it("use the primary group's accent, a text colour, not the accent surface", () => {
    const css = themeStyleSheet({ color_groups: DEFAULT_COLOR_GROUPS });
    expect(css).toContain(
      '--link-foreground-color: var(--primary-accent-color);',
    );
  });
});

describe('readableTextOn', () => {
  it.each([
    ['#ffffff', '#000000'],
    ['#a5d8ff', '#000000'],
    ['#74c0fc', '#000000'],
    ['#0f4c81', '#ffffff'],
    ['#343a40', '#ffffff'],
    ['#000', '#ffffff'],
  ])('on %s is %s', (background, expected) => {
    expect(readableTextOn(background)).toBe(expected);
  });

  it('falls back to white for a value it cannot read', () => {
    expect(readableTextOn('var(--x)')).toBe('#ffffff');
  });
});

describe('default palette', () => {
  it('ships a dark gray secondary and a dark blue accent', () => {
    expect(DEFAULT_COLOR_GROUPS.secondary.background_color_light).toBe(
      '#343a40',
    );
    expect(DEFAULT_COLOR_GROUPS.accent.background_color_light).toBe('#0f4c81');
  });
});
