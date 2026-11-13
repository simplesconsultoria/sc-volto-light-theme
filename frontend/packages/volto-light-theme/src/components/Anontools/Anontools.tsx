import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { useSelector, shallowEqual } from 'react-redux';
import type { ActionsResponse, Content } from '@plone/types';

type State = {
  content: {
    data: Content;
  };
  actions: {
    actions: ActionsResponse;
  };
};

/**
 * Login, register and logout links for the header bar.
 *
 * Based on the `@kitconcept/volto-light-theme` component, without its fixed
 * English `aria-label`s: the visible, translated text is the accessible name,
 * so voice-control users can activate a link by what they see (WCAG 2.5.3).
 */
const Anontools = () => {
  const content = useSelector<State, Content>(
    (state) => state.content.data,
    shallowEqual,
  );
  const actions = useSelector<State, ActionsResponse>(
    (state) => state.actions.actions,
    shallowEqual,
  );

  const loginAction = actions.user?.find((o) => o.id === 'login');
  const registerAction = actions.user?.find((o) => o.id === 'join');
  const logoutAction = actions.user?.find((o) => o.id === 'logout');

  return (
    <>
      {registerAction && (
        <Link to="/register">
          <FormattedMessage id="Register" defaultMessage="Register" />
        </Link>
      )}
      {loginAction && (
        <Link
          to={`/login${
            content?.['@id']
              ? `?return_url=${flattenToAppURL(content['@id'])}`
              : ''
          }`}
        >
          <FormattedMessage id="Log in" defaultMessage="Log in" />
        </Link>
      )}
      {logoutAction && (
        <Link to="/logout">
          <FormattedMessage id="Log out" defaultMessage="Log out" />
        </Link>
      )}
    </>
  );
};

export default Anontools;
