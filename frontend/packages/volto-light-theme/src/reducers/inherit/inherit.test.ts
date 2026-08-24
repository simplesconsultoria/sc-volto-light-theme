import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';
import { GET_INHERIT } from '../../constants/ActionTypes';
import inherit from './inherit';
import type { InheritState } from '../../types/inherit';

const hasApiExpander = vi.fn(() => true);

// Hoisted above the imports by vitest, so the reducer picks these up.
vi.mock('@plone/volto/helpers/Utils/Utils', () => ({
  hasApiExpander: (...args: unknown[]) => hasApiExpander(...(args as [])),
}));

vi.mock('@plone/volto/helpers/Url/Url', () => ({
  flattenToAppURL: (url: string) => url,
  getBaseUrl: (url: string) => url,
}));

const HEADER = 'sc.voltolighttheme.siteheader';
const FOOTER = 'sc.voltolighttheme.footer';

const expanderPayload = {
  '@id': 'http://localhost:8080/Plone/@inherit',
  [HEADER]: {
    from: { '@id': 'http://localhost:8080/Plone', title: 'Site' },
    data: { intranet_flag: 'Intranet' },
  },
};

/** A GET_CONTENT_SUCCESS action carrying the inherit expander. */
const contentSuccess = (
  inheritPayload?: Record<string, unknown>,
  extra: object = {},
) => ({
  type: `${GET_CONTENT}_SUCCESS`,
  result: {
    '@id': 'http://localhost:8080/Plone/a-page',
    '@components': inheritPayload ? { inherit: inheritPayload } : {},
  },
  ...extra,
});

const loadedState: InheritState = {
  data: expanderPayload,
  error: null,
  loaded: true,
  loading: false,
};

describe('inherit reducer', () => {
  beforeEach(() => {
    hasApiExpander.mockReturnValue(true);
  });

  it('starts empty and not loaded', () => {
    expect(inherit(undefined, {})).toEqual({
      data: {},
      error: null,
      loaded: false,
      loading: false,
    });
  });

  it('returns the state untouched for an unrelated action', () => {
    expect(inherit(loadedState, { type: 'SOMETHING_ELSE' })).toBe(loadedState);
  });

  describe('on GET_CONTENT_SUCCESS', () => {
    it('stores the inherit expander payload', () => {
      const state = inherit(undefined, contentSuccess(expanderPayload));
      expect(state.data).toEqual(expanderPayload);
      expect(state.loaded).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('replaces the previous payload wholesale', () => {
      // A behavior absent from a response that *does* carry the expander has
      // no provider up the acquisition chain, so it must be cleared.
      const next = { '@id': 'x', [FOOTER]: { data: { footer_note: 'Only' } } };
      const state = inherit(loadedState, contentSuccess(next));
      expect(state.data).toEqual(next);
      expect(state.data[HEADER]).toBeUndefined();
    });

    it('keeps the previous payload when the response has no inherit key', () => {
      // This is the anti-flicker guard: `state.content.data` would be replaced
      // wholesale here and blank every inherited value.
      const state = inherit(loadedState, contentSuccess(undefined));
      expect(state).toBe(loadedState);
    });

    it('keeps the previous payload when the expander is not configured', () => {
      hasApiExpander.mockReturnValue(false);
      const state = inherit(loadedState, contentSuccess(expanderPayload));
      expect(state).toBe(loadedState);
    });

    it('ignores subrequests', () => {
      const state = inherit(
        loadedState,
        contentSuccess({ '@id': 'other' }, { subrequest: 'listing' }),
      );
      expect(state).toBe(loadedState);
    });

    it('does not fail when the result carries no @id', () => {
      expect(() =>
        inherit(undefined, {
          type: `${GET_CONTENT}_SUCCESS`,
          result: { '@components': { inherit: expanderPayload } },
        }),
      ).not.toThrow();
    });
  });

  describe('on GET_CONTENT_PENDING', () => {
    it('has no case at all, so the payload survives the fetch', () => {
      // The absence of a PENDING case is the entire point of this reducer.
      const state = inherit(loadedState, { type: `${GET_CONTENT}_PENDING` });
      expect(state).toBe(loadedState);
      expect(state.data).toEqual(expanderPayload);
    });
  });

  describe('leaving a CMS-UI route for a content route', () => {
    // Replays the action sequence recorded in a real session (devtools export,
    // indices 43-48) when navigating from /edit back to /. Volto's
    // `protectLoadStart` middleware sets `resetBeforeFetch` whenever the route
    // it departs from `isCmsUi`, which makes `protectLoadEnd` dispatch
    // RESET_CONTENT ahead of GET_CONTENT_PENDING. That nulls
    // `state.content.data`, and UNLOCK_CONTENT_SUCCESS then repopulates it
    // without an `@components` key — so anything reading the inherit expander
    // off the content is blank for the whole window. This slice must not be.
    const RECORDED_SEQUENCE = [
      { type: 'UNLOCK_CONTENT_PENDING' },
      { type: 'RESET_CONTENT' },
      { type: `${GET_CONTENT}_PENDING` },
      // Repopulates content.data with an object that has no '@components'.
      { type: 'UNLOCK_CONTENT_SUCCESS', result: { '@id': 'x' } },
      { type: 'EXPAND_TOOLBAR' },
    ];

    it('keeps the payload through every action of the reset window', () => {
      let state = loadedState;
      for (const action of RECORDED_SEQUENCE) {
        state = inherit(state, action);
        expect(state.data).toEqual(expanderPayload);
      }
    });

    it('takes the fresh payload once the content request lands', () => {
      let state = loadedState;
      for (const action of RECORDED_SEQUENCE) {
        state = inherit(state, action);
      }

      const fresh = { '@id': 'y', [FOOTER]: { data: { footer_note: 'New' } } };
      state = inherit(state, contentSuccess(fresh));
      expect(state.data).toEqual(fresh);
    });
  });

  describe('on the standalone GET_INHERIT request', () => {
    it('marks loading without blanking the payload', () => {
      const state = inherit(loadedState, { type: `${GET_INHERIT}_PENDING` });
      expect(state.loading).toBe(true);
      expect(state.data).toEqual(expanderPayload);
    });

    it('stores the payload returned directly by the @inherit service', () => {
      const state = inherit(undefined, {
        type: `${GET_INHERIT}_SUCCESS`,
        result: expanderPayload,
      });
      expect(state.data).toEqual(expanderPayload);
      expect(state.loaded).toBe(true);
    });

    it('records the error but keeps the payload on failure', () => {
      const error = new Error('boom');
      const state = inherit(loadedState, {
        type: `${GET_INHERIT}_FAIL`,
        error,
      });
      expect(state.error).toBe(error);
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(expanderPayload);
    });
  });
});
