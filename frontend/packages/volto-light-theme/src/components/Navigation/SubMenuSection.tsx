import { NavLink } from 'react-router-dom';
import type { NavigationItem } from './types';
import { defineMessages, useIntl } from 'react-intl';

type SubMenuSectionProps = {
  item: NavigationItem;
  closeMenu: () => void;
};

const messages = defineMessages({
  section: {
    id: 'section',
    defaultMessage: 'Seção',
  },
});

const SubMenuSection = ({ item, closeMenu }: SubMenuSectionProps) => {
  const intl = useIntl();
  const sectionLabel = intl.formatMessage(messages.section);
  return (
    <div className="submenu-section">
      <span className="submenu-section-label">{sectionLabel}</span>
      <NavLink
        to={item.url === '' ? '/' : item.url}
        onClick={() => closeMenu()}
        className="submenu-header-wrapper"
      >
        <div className="submenu-header">
          <h2>{item.nav_title ?? item.title}</h2>
          <p className="submenu-description">{item.description}</p>
        </div>
      </NavLink>
    </div>
  );
};

export default SubMenuSection;
