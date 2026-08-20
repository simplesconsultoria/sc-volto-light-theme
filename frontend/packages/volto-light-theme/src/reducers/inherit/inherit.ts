import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { hasApiExpander } from '@plone/volto/helpers/Utils/Utils';
import { GET_INHERIT } from '../../constants/ActionTypes';
import type { InheritExpander, InheritState } from '../../types/inherit';

const initialState: InheritState = {
  data: {},
  error: null,
  loaded: false,
  loading: false,
};

/**
 * A redux-connect action. `result` is either a full content object (whose
 * inherit data sits under `@components`) or the `@inherit` service payload
 * itself, so it is kept loose and narrowed at each use.
 */
type Action = {
  type?: string;
  subrequest?: string;
  error?: unknown;
  result?: Record<string, unknown>;
};

/**
 * Inherited-behavior reducer, modelled on Volto's `navigation` reducer.
 *
 * The point of holding this in its own slice is the guard on
 * `GET_CONTENT_SUCCESS`: `state.content.data` is replaced unconditionally, so
 * a response without an `inherit` expander blanks every value read from it —
 * which is what makes the header and footer flicker on route changes. Here a
 * response that carries no `inherit` key leaves the previous values in place,
 * exactly as `navigation` keeps its items.
 *
 * A response that *does* carry the key is authoritative and replaces the slice
 * wholesale: a behavior missing from it has no provider up the acquisition
 * chain, so clearing it is correct.
 */
export default function inherit(
  state: InheritState = initialState,
  action: Action = {},
): InheritState {
  switch (action.type) {
    // Deliberately no `${GET_CONTENT}_PENDING` case: keeping the previous
    // values during the fetch is the whole reason this reducer exists.
    case `${GET_CONTENT}_SUCCESS`: {
      const components = action.result?.['@components'] as
        | { inherit?: InheritExpander }
        | undefined;
      const data = components?.inherit;
      const hasExpander = hasApiExpander(
        'inherit',
        getBaseUrl(flattenToAppURL((action.result?.['@id'] as string) ?? '')),
      );

      if (hasExpander && !action.subrequest && data) {
        return { ...state, error: null, data, loaded: true, loading: false };
      }
      return state;
    }
    case `${GET_INHERIT}_PENDING`:
      // Keep `data` — a refresh in flight must not blank the chrome.
      return { ...state, error: null, loading: true };
    case `${GET_INHERIT}_SUCCESS`: {
      // The standalone `@inherit` service returns the expander payload
      // directly, rather than nested under `@components`.
      const { '@components': components, ...data } = action.result ?? {};
      return {
        ...state,
        error: null,
        data: data as InheritExpander,
        loaded: true,
        loading: false,
      };
    }
    case `${GET_INHERIT}_FAIL`:
      // Unlike `navigation`, the previous values are kept on failure: blanking
      // them would reintroduce the flicker this reducer exists to prevent.
      return { ...state, error: action.error, loading: false };
    default:
      return state;
  }
}
