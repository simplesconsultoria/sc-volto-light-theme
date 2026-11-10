import SubMenuItem from './SubMenuItem';
import type { NavigationItem } from '@simplesconsultoria/volto-light-theme/types/navigation';

type SubMenuItemsProps = {
  items: NavigationItem[];
  pathname: string;
  closeMenu: () => void;
};

const SubMenuItems = ({ items, pathname, closeMenu }: SubMenuItemsProps) => {
  const visibleItems = items ? items.slice(0, 8) : [];

  return (
    <div className="submenu-items">
      {visibleItems.map((subitem) => (
        <SubMenuItem
          key={subitem.url}
          item={subitem}
          pathname={pathname}
          closeMenu={closeMenu}
        />
      ))}
    </div>
  );
};

export default SubMenuItems;
