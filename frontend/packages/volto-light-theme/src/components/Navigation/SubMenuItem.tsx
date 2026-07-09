import { NavLink } from 'react-router-dom';
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
    <NavLink
      to={item.url}
      onClick={() => closeMenu()}
      className={cx({
        'subitem-wrapper': true,
        current: isActive(item.url),
      })}
    >
      <h3 className="subitem-title">{item.nav_title || item.title}</h3>
      <span className="subitem-description">{item.description}</span>
    </NavLink>
  );
};

export default SubMenuItem;
