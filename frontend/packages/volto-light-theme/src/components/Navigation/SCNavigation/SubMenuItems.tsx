import SubMenuItem from './SubMenuItem';
import type { NavigationItem } from '@simplesconsultoria/volto-light-theme/types/navigation';

type SubMenuItemsProps = {
  items: NavigationItem[];
  pathname: string;
  closeMenu: () => void;
};

const SubMenuItems = ({ items, pathname, closeMenu }: SubMenuItemsProps) => {
  return (
    <div className="submenu-items">
      {items &&
        items.length > 0 &&
        items.map((subitem) => (
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
