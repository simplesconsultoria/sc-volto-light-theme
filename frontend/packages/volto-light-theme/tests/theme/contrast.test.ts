import { describe, it, expect } from 'vitest';
import { DEFAULT_COLOR_GROUPS } from '@simplesconsultoria/volto-light-theme/config/blockThemes';

/** WCAG 2.1 relative luminance of a `#rrggbb` color. */
const luminance = (hex: string): number => {
  const channels = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.1 contrast ratio between two `#rrggbb` colors. */
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const ROLES = ['text', 'subtext', 'accent'] as const;
const MODES = ['light', 'dark'] as const;

const pairs = Object.entries(DEFAULT_COLOR_GROUPS).flatMap(([id, group]) =>
  MODES.flatMap((mode) =>
    ROLES.map((role) => {
      const g = group as unknown as Record<string, string>;
      return {
        name: `${id} ${mode} ${role}`,
        foreground: g[`${role}_color_${mode}`],
        background: g[`background_color_${mode}`],
      };
    }),
  ),
);

describe('default Color Groups contrast (WCAG 2.1 AA)', () => {
  it('covers 4 groups x 3 roles x 2 modes', () => {
    expect(pairs).toHaveLength(24);
  });

  it.each(pairs)(
    '$name: $foreground on $background is at least 4.5:1',
    ({ foreground, background }) => {
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('measures a known pair', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#a5d8ff', '#ffffff')).toBeCloseTo(1.51, 2);
  });
});
