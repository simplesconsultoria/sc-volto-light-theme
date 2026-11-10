import { describe, it, expect, vi } from 'vitest';
import {
  buildEnrichedListingData,
  getCardBorder,
  getListingPagination,
  resolveSearchVariation,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/Search/searchBlockData';

const { TopSideFacets, registry } = vi.hoisted(() => ({
  TopSideFacets: () => null,
  registry: {
    blocks: { blocksConfig: { search: { variations: [] as any[] } } },
  },
}));

vi.mock(
  '@plone/volto/components/manage/Blocks/Search/layout/TopSideFacets',
  () => ({ default: TopSideFacets }),
);
vi.mock('@plone/volto/registry', () => ({ default: registry }));

describe('resolveSearchVariation', () => {
  const View = () => null;

  it('keeps a variation that has a view', () => {
    const variation = { id: 'x', view: View };
    expect(resolveSearchVariation(variation, {})).toBe(variation);
  });

  it('looks up data.variation, then facetsTopSide, default, first', () => {
    const vars = [
      { id: 'first' },
      { id: 'def', isDefault: true },
      { id: 'facetsTopSide' },
      { id: 'chosen' },
    ];
    registry.blocks.blocksConfig.search.variations = vars;
    expect(resolveSearchVariation(undefined, { variation: 'chosen' })).toBe(
      vars[3],
    );
    expect(resolveSearchVariation({ id: 'noview' }, {})).toBe(vars[2]);
    registry.blocks.blocksConfig.search.variations = vars.slice(0, 2);
    expect(resolveSearchVariation(undefined, {})).toBe(vars[1]);
    registry.blocks.blocksConfig.search.variations = vars.slice(0, 1);
    expect(resolveSearchVariation(undefined, {})).toBe(vars[0]);
  });

  it('falls back to TopSideFacets without variations', () => {
    registry.blocks.blocksConfig.search.variations = [];
    expect(resolveSearchVariation(undefined, {})).toEqual({
      id: 'facetsTopSide',
      view: TopSideFacets,
    });
  });
});

describe('getCardBorder', () => {
  it('reads top-level values before styles', () => {
    expect(
      getCardBorder({
        '--cardBorderWidth': '2px',
        styles: { '--cardBorderWidth': '9px', '--cardBorderColor': 'red' },
      }),
    ).toEqual({
      cardBorderWidth: '2px',
      cardBorderColor: 'red',
      borderStyles: { '--cardBorderWidth': '2px', '--cardBorderColor': 'red' },
    });
  });

  it('returns empty values and no styles when unset', () => {
    expect(getCardBorder(undefined)).toEqual({
      cardBorderWidth: '',
      cardBorderColor: '',
      borderStyles: {},
    });
  });
});

describe('buildEnrichedListingData', () => {
  it('merges data, query defaults, view, theme, width and border', () => {
    const result = buildEnrichedListingData({
      data: { a: 1, styles: { s: 1 }, '--cardBorderColor': 'blue' },
      listingBodyData: { query: [], styles: { t: 2 } },
      selectedView: 'grid',
      blockWidth: 'full',
      theme: 'dark',
      backColorGroup: 'b',
      frontColorGroup: 'f',
    });
    expect(result).toEqual({
      a: 1,
      query: [],
      variation: 'grid',
      listingBodyTemplate: 'grid',
      theme: 'dark',
      backColorGroup: 'b',
      frontColorGroup: 'f',
      blockWidth: 'full',
      styles: {
        s: 1,
        t: 2,
        variation: 'grid',
        listingBodyTemplate: 'grid',
        theme: 'dark',
        backColorGroup: 'b',
        frontColorGroup: 'f',
        'blockWidth:noprefix': 'full',
        '--cardBorderColor': 'blue',
      },
      '--cardBorderWidth': '',
      '--cardBorderColor': 'blue',
    });
  });
});

describe('getListingPagination', () => {
  it('computes pages from the block b_size, then search b_size, then 25', () => {
    expect(
      getListingPagination({ totalItems: 30 }, { b_size: 10 }, { b_size: 5 })
        .totalPages,
    ).toBe(3);
    expect(
      getListingPagination({ totalItems: 30 }, {}, { b_size: 5 }).totalPages,
    ).toBe(6);
    expect(getListingPagination({ totalItems: 30 }, {}, {}).totalPages).toBe(2);
  });

  it('defaults to one page, page 1 and the item count', () => {
    const items = [{}, {}];
    const result = getListingPagination({ items }, {}, undefined);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.listingItems).toBe(items);
    expect(result.totalItems).toBe(2);
    expect(result.onPaginationChange()).toBeUndefined();
  });
});
