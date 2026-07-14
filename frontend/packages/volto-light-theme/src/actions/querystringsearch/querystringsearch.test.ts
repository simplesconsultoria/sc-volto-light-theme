import { describe, expect, it } from 'vitest';
import { GET_QUERYSTRING_RESULTS } from '@plone/volto/constants/ActionTypes';
import { getQueryStringResults } from './querystringsearch';
import type { QuerystringData } from './querystringsearch';

const data: QuerystringData = {
  query: [
    {
      i: 'portal_type',
      o: 'plone.app.querystring.operation.selection.any',
      v: ['Document'],
    },
  ],
};

describe('getQueryStringResults', () => {
  it('creates a querystring-search action', () => {
    const action = getQueryStringResults('', data);

    expect(action.type).toEqual(GET_QUERYSTRING_RESULTS);
    expect(action.request.op).toEqual('post');
    expect(action.request.path).toEqual('/@querystring-search');
  });

  it('batches by the default page size', () => {
    const action = getQueryStringResults('', data, undefined, 2);

    expect(action.request.data).toEqual({ ...data, b_size: 25, b_start: 25 });
  });

  it('batches by the configured b_size', () => {
    const action = getQueryStringResults('', { ...data, b_size: 10 }, 'sub', 3);

    expect(action.request.data).toMatchObject({ b_size: 10, b_start: 20 });
  });

  // Regression: QueryWidget's reference lookup calls this action with no page.
  // `undefined - 1` produced NaN, which serialised to a null b_start.
  it('starts at 0 when called without a page', () => {
    const action = getQueryStringResults('', { ...data, b_size: 1 }, 'ref');

    expect(action.request.data?.b_start).toBe(0);
    expect(JSON.stringify(action.request.data)).toContain('"b_start":0');
  });

  describe('offset', () => {
    it('skips the leading items on the first page', () => {
      const action = getQueryStringResults(
        '',
        { ...data, b_size: 10, offset: 3 },
        'sub',
        1,
      );

      expect(action.request.data).toMatchObject({ b_start: 3 });
    });

    it('stays applied while paginating', () => {
      const action = getQueryStringResults(
        '',
        { ...data, b_size: 10, offset: 3 },
        'sub',
        2,
      );

      expect(action.request.data).toMatchObject({ b_start: 13 });
    });

    it('tolerates an offset stored as a string by the widget', () => {
      const action = getQueryStringResults(
        '',
        { ...data, b_size: 10, offset: '3' },
        'sub',
        2,
      );

      expect(action.request.data).toMatchObject({ b_start: 13 });
    });
  });
});
