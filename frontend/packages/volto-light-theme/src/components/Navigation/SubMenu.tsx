import cx from 'classnames';
import SubMenuSection from './SubMenuSection';
import SubMenuItems from './SubMenuItems';
import { defineMessages, useIntl } from 'react-intl';
import clearSVG from '@plone/volto/icons/clear.svg';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import type { NavigationItem } from './types';

type SubMenuProps = {
  index: number;
  item: NavigationItem;
  pathname: string;
  desktopMenuOpen: number | null;
  closeMenu: () => void;
};

const messages = defineMessages({
  closeMenu: {
    id: 'Close menu',
    defaultMessage: 'Close menu',
  },
});

const SubMenu = ({
  index,
  desktopMenuOpen,
  item,
  pathname,
  closeMenu,
}: SubMenuProps) => {
  const intl = useIntl();
  return (
    <div className="submenu-wrapper">
      <div
        className={cx('submenu', {
          active: desktopMenuOpen === index,
        })}
      >
        <div className="submenu-inner">
          <button
            className="close"
            onClick={closeMenu}
            aria-label={intl.formatMessage(messages.closeMenu)}
          >
            <Icon name={clearSVG} size="48px" />
          </button>
          <div className="submenu-content">
            <SubMenuSection item={item} closeMenu={closeMenu} />
            <SubMenuItems
              items={item.items || []}
              pathname={pathname}
              closeMenu={closeMenu}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubMenu;
