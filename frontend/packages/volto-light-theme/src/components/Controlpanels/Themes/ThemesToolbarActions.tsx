import { Button } from 'semantic-ui-react';
import { useIntl } from 'react-intl';

import Icon from '@plone/volto/components/theme/Icon/Icon';
import addSVG from '@plone/volto/icons/add.svg';
import backSVG from '@plone/volto/icons/back.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import saveSVG from '@plone/volto/icons/save.svg';

import messages from './messages';

export type ThemesToolbarActionsProps = {
  /** Show the form's Save/Cancel pair rather than the listing's Add/Back. */
  isForm: boolean;
  onSave: () => void;
  onCancel: () => void;
  onAdd: () => void;
  /** Where Back leads; the control panel index by default. */
  backHref?: string;
};

/**
 * What goes inside Volto's toolbar while the panel is open.
 *
 * Split out from the panel because the toolbar is rendered through a portal
 * into `#toolbar`: keeping the buttons in their own component means they can
 * be seen on their own, without a portal target or a Redux store.
 *
 * Back is an anchor rather than a button — it is a navigation, and the toolbar
 * styles `.item` for exactly that.
 */
const ThemesToolbarActions = ({
  isForm,
  onSave,
  onCancel,
  onAdd,
  backHref = '/controlpanel',
}: ThemesToolbarActionsProps) => {
  const intl = useIntl();

  if (isForm) {
    return (
      <>
        <Button
          id="toolbar-save"
          className="save"
          aria-label={intl.formatMessage(messages.save)}
          onClick={onSave}
        >
          <Icon
            name={saveSVG}
            className="circled"
            size="30px"
            title={intl.formatMessage(messages.save)}
          />
        </Button>
        <Button
          className="cancel"
          aria-label={intl.formatMessage(messages.cancel)}
          onClick={onCancel}
        >
          <Icon
            name={clearSVG}
            className="circled"
            size="30px"
            title={intl.formatMessage(messages.cancel)}
          />
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        id="toolbar-add"
        aria-label={intl.formatMessage(messages.add)}
        onClick={onAdd}
      >
        <Icon
          name={addSVG}
          className="circled"
          size="30px"
          title={intl.formatMessage(messages.add)}
        />
      </Button>
      <a className="item" href={backHref}>
        <Icon
          name={backSVG}
          className="circled"
          size="30px"
          title={intl.formatMessage(messages.back)}
        />
      </a>
    </>
  );
};

export default ThemesToolbarActions;
