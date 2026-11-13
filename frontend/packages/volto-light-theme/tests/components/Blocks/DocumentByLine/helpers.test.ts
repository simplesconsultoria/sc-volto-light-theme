import {
  hasByLineData,
  resolveBaseContent,
  withByLineFallback,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/DocumentByLine/helpers';

describe('DocumentByLine helpers', () => {
  it('detects byline data', () => {
    expect(hasByLineData(undefined)).toBe(false);
    expect(hasByLineData({ creators: [] } as any)).toBe(false);
    expect(hasByLineData({ creators: ['a'] } as any)).toBe(true);
    expect(hasByLineData({ effective: '2020' } as any)).toBe(true);
    expect(hasByLineData({ modified: '2020' } as any)).toBe(true);
  });

  describe('resolveBaseContent', () => {
    const state = { title: 'state', effective: 's' } as any;
    const props = { title: 'props', modified: 'p' } as any;
    const meta = { title: 'meta', creators: ['m'] } as any;

    it('lets metadata win when it has byline data', () => {
      expect(resolveBaseContent(state, props, meta)).toEqual({
        ...state,
        ...props,
        ...meta,
      });
    });

    it('falls back to properties when metadata has no byline data', () => {
      expect(resolveBaseContent(state, props, { title: 'm' } as any)).toEqual({
        ...state,
        ...props,
      });
    });

    it('otherwise returns the first available source', () => {
      const empty = { title: 'x' } as any;
      expect(resolveBaseContent(state, empty, empty)).toBe(state);
      expect(resolveBaseContent(undefined, undefined, empty)).toBe(empty);
      expect(resolveBaseContent(undefined, empty, undefined)).toBe(empty);
      expect(resolveBaseContent()).toEqual({});
    });
  });

  describe('withByLineFallback', () => {
    it('returns content that already has byline data', () => {
      const content = { effective: 'e' } as any;
      expect(withByLineFallback(content, {})).toBe(content);
    });

    it('fills empty content from block data, then defaults', () => {
      expect(
        withByLineFallback({} as any, {
          effective: 'e',
          modified: 'm',
          creators: ['c'],
        }),
      ).toEqual({ effective: 'e', modified: 'm', creators: ['c'] });

      const result = withByLineFallback({} as any, {});
      expect(result.creators).toEqual(['admin']);
      expect(typeof result.effective).toBe('string');
      expect(typeof result.modified).toBe('string');
    });
  });
});
