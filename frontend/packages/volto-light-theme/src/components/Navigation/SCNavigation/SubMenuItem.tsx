import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import cx from 'classnames';
import type { NavigationItem } from '@simplesconsultoria/volto-light-theme/types/navigation';

type SubMenuItemProps = {
  item: NavigationItem;
  pathname: string;
  closeMenu: () => void;
};

const SubMenuItem = ({ item, pathname, closeMenu }: SubMenuItemProps) => {
  const isActive = (url: string) => {
    return (url === '' && pathname === '/') || (url !== '' && pathname === url);
  };
  const wrapperClasses = cx({
    'subitem-wrapper': true,
    current: isActive(item.url),
  });

  const linkContent = (
    <div className="subitem-content">
      <h3 className="subitem-title">{item.nav_title || item.title}</h3>
      {item.description && (
        <span className="subitem-description">{item.description}</span>
      )}
    </div>
  );

  if (item.items && item.items.length > 0) {
    return (
      <div className={wrapperClasses}>
        <UniversalLink
          href={item.url}
          onClick={() => closeMenu()}
          className="subitem-link"
        >
          {linkContent}
        </UniversalLink>
        <ul className="subitem-children">
          {item.items.map((subitem) => (
            <li key={subitem.url}>
              <UniversalLink
                href={subitem.url}
                onClick={() => closeMenu()}
                className="subitem-child-link"
              >
                <span className="subitem-child-title">
                  <span>&#8212; </span>
                  {subitem.nav_title || subitem.title}
                </span>
                {subitem.description && (
                  <span className="subitem-child-description">
                    {subitem.description}
                  </span>
                )}
              </UniversalLink>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <UniversalLink
      href={item.url}
      onClick={() => closeMenu()}
      className={wrapperClasses}
    >
      {linkContent}
    </UniversalLink>
  );
};

export default SubMenuItem;
