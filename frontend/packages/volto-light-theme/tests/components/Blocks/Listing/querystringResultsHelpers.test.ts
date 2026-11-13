import { describe, expect, it, vi } from 'vitest';
import {
  buildAdaptedQuery,
  buildListingFetchAction,
  isImageGalleryListing,
  resolveListingResults,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/Listing/querystringResultsHelpers';

vi.mock('@plone/volto/actions/content/content', () => ({
  getContent: (...args: any[]) => ({ type: 'GET_CONTENT', args }),
}));
vi.mock('@plone/volto/actions/querystringsearch/querystringsearch', () => ({
  getQueryStringResults: (...args: any[]) => ({ type: 'QUERY', args }),
}));

describe('buildAdaptedQuery', () => {
  it('asks for all metadata and copies only the defined query fields', () => {
    expect(
      buildAdaptedQuery({ query: [1], sort_on: 'created', foo: 1 }, {}, 10),
    ).toEqual({
      metadata_fields: '_all',
      b_size: 10,
      offset: 0,
      query: [1],
      sort_on: 'created',
    });
  });

  it('asks for full objects when the variation needs them', () => {
    expect(buildAdaptedQuery({ offset: 3 }, { fullobjects: true }, 5)).toEqual({
      fullobjects: 1,
      b_size: 5,
      offset: 3,
    });
  });
});

describe('isImageGalleryListing', () => {
  it('detects the variation and the legacy template', () => {
    expect(isImageGalleryListing({ variation: 'imageGallery' })).toBe(true);
    expect(isImageGalleryListing({ template: 'imageGallery' })).toBe(true);
    expect(
      isImageGalleryListing({ variation: 'grid', template: 'imageGallery' }),
    ).toBe(false);
  });
});

describe('resolveListingResults', () => {
  it('lists folder children and paginates past the batch size', () => {
    const content = {
      is_folderish: true,
      items: [{ id: 'a' }],
      items_total: 25,
      batching: { prev: 'p', next: 'n' },
    };
    expect(
      resolveListingResults({
        content,
        subrequest: undefined,
        hasQuery: false,
        b_size: 10,
        offset: 0,
      }),
    ).toMatchObject({
      listingItems: content.items,
      hasLoaded: true,
      showAsFolderListing: true,
      totalPages: 3,
      prevBatch: 'p',
      nextBatch: 'n',
    });
  });

  it('lists query results, counting only items past the offset', () => {
    const subrequest = {
      loaded: true,
      items: [{ id: 'x' }],
      total: 25,
      batching: { next: 'n' },
    };
    expect(
      resolveListingResults({
        content: {},
        subrequest,
        hasQuery: true,
        b_size: 10,
        offset: 5,
      }),
    ).toMatchObject({
      listingItems: subrequest.items,
      hasLoaded: true,
      visibleTotal: 20,
      showAsFolderListing: false,
      totalPages: 2,
      prevBatch: undefined,
      nextBatch: 'n',
    });
  });

  it('does not paginate a single page', () => {
    expect(
      resolveListingResults({
        content: {},
        subrequest: undefined,
        hasQuery: true,
        b_size: 10,
        offset: 0,
      }),
    ).toMatchObject({
      listingItems: [],
      hasLoaded: undefined,
      totalPages: 0,
      prevBatch: null,
      nextBatch: null,
    });
  });
});

describe('buildListingFetchAction', () => {
  const base = {
    initialPath: '/folder',
    adaptedQuery: { b_size: 10 },
    subrequestID: 'sub',
    currentPage: 2,
  };

  it('runs the query when there is one', () => {
    expect(
      buildListingFetchAction({
        ...base,
        hasQuery: true,
        isImageGallery: true,
      }),
    ).toEqual({
      type: 'QUERY',
      args: ['/folder', { b_size: 10 }, 'sub', 2],
    });
  });

  it('lists every child for a query-less image gallery', () => {
    const action: any = buildListingFetchAction({
      ...base,
      hasQuery: false,
      isImageGallery: true,
    });
    expect(action.type).toBe('QUERY');
    expect(action.args[1].b_size).toBe(10000000000);
    expect(action.args[1].query[0].i).toBe('path');
    expect(action.args).toHaveLength(3);
  });

  it('fetches the context otherwise', () => {
    expect(
      buildListingFetchAction({
        ...base,
        hasQuery: false,
        isImageGallery: false,
      }),
    ).toEqual({ type: 'GET_CONTENT', args: ['/folder', null, null, 2] });
  });
});
