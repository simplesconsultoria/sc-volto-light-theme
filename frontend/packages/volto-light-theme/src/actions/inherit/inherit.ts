import { GET_INHERIT } from '../../constants/ActionTypes';

/**
 * Fetch the inherited behavior values for a content object.
 *
 * Normally the data arrives for free on the `GET_CONTENT` response, because
 * this add-on registers an `inherit` api expander. This standalone action
 * exists for the cases where it does not — refreshing after an edit, or a
 * caller that needs the values without re-fetching the whole object.
 *
 * @param url Content url.
 * @param behaviors Behavior names to resolve, in the order to request them.
 */
export function getInherit(url: string, behaviors: string[]) {
  return {
    type: GET_INHERIT,
    request: {
      op: 'get',
      path: `${url}/@inherit?expand.inherit.behaviors=${behaviors.join(',')}`,
    },
  };
}
