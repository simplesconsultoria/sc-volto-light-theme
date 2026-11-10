import { describe, expect, it } from 'vitest';
import {
  buildCardBorderStyle,
  getResultRange,
  resolveListingItems,
  resolveListingTemplate,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/Listing/listingBodyHelpers';

describe('resolveListingItems', () => {
  it('prefers non-empty listingItems, then items', () => {
    expect(resolveListingItems([1], [2])).toEqual([1]);
    expect(resolveListingItems([], [2])).toEqual([2]);
  });

  it('falls back to listingItems, then an empty list', () => {
    const empty: any[] = [];
    expect(resolveListingItems(empty, undefined)).toBe(empty);
    expect(resolveListingItems(undefined, undefined)).toEqual([]);
  });
});

describe('resolveListingTemplate', () => {
  const Grid = () => null;
  const Summary = () => null;
  const Custom = () => null;
  const variations = [
    { id: 'summary', template: Summary, isDefault: true },
    { id: 'grid', template: Grid },
  ];

  it('uses the legacy template when there is no variation', () => {
    expect(resolveListingTemplate({ template: 'grid' }, null, variations)).toBe(
      Grid,
    );
    expect(
      resolveListingTemplate({ template: 'missing' }, null, variations),
    ).toBeUndefined();
  });

  it("uses the variation's template, then the default variation's", () => {
    expect(
      resolveListingTemplate(
        { variation: 'x', template: 'grid' },
        { template: Custom },
        variations,
      ),
    ).toBe(Custom);
    expect(resolveListingTemplate({}, undefined, variations)).toBe(Summary);
    expect(resolveListingTemplate({}, undefined, [])).toBeNull();
  });
});

describe('buildCardBorderStyle', () => {
  it('mirrors card border values onto the theme border properties', () => {
    expect(
      buildCardBorderStyle({
        '--cardBorderWidth': '2px',
        styles: { '--cardBorderColor': 'red' },
      }),
    ).toEqual({
      '--cardBorderWidth': '2px',
      '--theme-border-width': '2px',
      '--cardBorderColor': 'red',
      '--theme-border-color': 'red',
    });
  });

  it('is empty when no border is set', () => {
    expect(buildCardBorderStyle({})).toEqual({});
  });
});

describe('getResultRange', () => {
  it('numbers the results shown on the current page', () => {
    expect(getResultRange(1, 10, 10)).toEqual({ first: 1, last: 10 });
    expect(getResultRange(3, 10, 4)).toEqual({ first: 21, last: 24 });
  });
});
