import cx from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
import NavItem from '@plone/volto/components/theme/Navigation/NavItem';
import SubMenu from './SubMenu';
import type { NavigationItem } from './types';

type MenuItemProps = {
  index: number;
  hasFatMenu: boolean;
  item: NavigationItem;
  pathname: string;
  lang: string;
  desktopMenuOpen: number | null;
  openMenu: (index: number) => void;
  closeMenu: () => void;
};

const messages = defineMessages({
  openFatMenu: {
    id: 'Open menu',
    defaultMessage: 'Open menu',
  },
});

const MenuItem = ({
  index,
  hasFatMenu,
  desktopMenuOpen,
  item,
  pathname,
  lang,
  openMenu,
  closeMenu,
}: MenuItemProps) => {
  const intl = useIntl();
  const hasItems = item.items && item.items.length > 0;
  return (
    <li key={item.url}>
      {hasFatMenu && hasItems ? (
        <>
          <button
            onClick={() => openMenu(index)}
            className={cx('item', {
              active:
                desktopMenuOpen === index ||
                (!desktopMenuOpen && pathname === item.url),
            })}
            aria-label={intl.formatMessage(messages.openFatMenu)}
            aria-expanded={desktopMenuOpen === index}
          >
            {item.title}
          </button>
          <SubMenu
            index={index}
            item={item}
            desktopMenuOpen={desktopMenuOpen}
            pathname={pathname}
            closeMenu={closeMenu}
          />
        </>
      ) : (
        <NavItem item={item} lang={lang} key={item.url} />
      )}
    </li>
  );
};

export default MenuItem;
