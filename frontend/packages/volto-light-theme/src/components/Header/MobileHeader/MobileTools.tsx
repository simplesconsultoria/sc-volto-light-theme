import React, { useState, useRef, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import config from '@plone/volto/registry';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import moreIcon from '@plone/volto/icons/more.svg';
import HeaderBarActions from '../../HeaderBar/HeaderBarActions';
import useClickOutside from '../../../hooks/useClickOutside';

const messages = defineMessages({
  accessibilityOptions: {
    id: 'Accessibility options',
    defaultMessage: 'Accessibility options',
  },
});

type MobileToolsProps = {
  token?: string | null;
};

const MobileTools: React.FC<MobileToolsProps> = ({ token }) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { headerBar } = config.settings?.scvlt || {};
  const display = headerBar?.display ?? false;

  const close = useCallback(() => setIsOpen(false), []);

  // Close on outside click or Escape
  useClickOutside(dropdownRef, close, isOpen);

  return display ? (
    <div className="mobile-tools-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="mobile-tools-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={intl.formatMessage(messages.accessibilityOptions)}
      >
        <Icon name={moreIcon} size="30px" />
      </button>

      {isOpen && (
        <div className="mobile-tools-menu">
          <HeaderBarActions
            token={token}
            className={'mobile-tools-menu-inner'}
          />
        </div>
      )}
    </div>
  ) : null;
};

export default MobileTools;
