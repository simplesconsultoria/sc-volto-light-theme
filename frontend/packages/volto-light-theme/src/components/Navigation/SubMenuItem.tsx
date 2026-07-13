import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import cx from 'classnames';
import type { NavigationItem } from './types';

type SubMenuItemProps = {
  item: NavigationItem;
  pathname: string;
  closeMenu: () => void;
};

const SubMenuItem = ({ item, pathname, closeMenu }: SubMenuItemProps) => {
  const isActive = (url: string) => {
    return (url === '' && pathname === '/') || (url !== '' && pathname === url);
  };
  return (
    <UniversalLink
      href={item.url}
      onClick={() => closeMenu()}
      className={cx({
        'subitem-wrapper': true,
        current: isActive(item.url),
      })}
    >
      <h3 className="subitem-title">{item.nav_title || item.title}</h3>
      <span className="subitem-description">{item.description}</span>
    </UniversalLink>
  );
};

export default SubMenuItem;
