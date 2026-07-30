import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';
import { Container } from '@plone/components';
import config from '@plone/volto/registry';
import type { Content } from '@plone/types';
import HeaderBarActions from './HeaderBarActions';
import { useAutoCollapse } from '../../hooks/useAutoCollapse';
import useClickOutside from '../../hooks/useClickOutside';

type HeaderBarProps = {
  content: Content;
  navRoot: Content;
  location: any;
};

type RootState = {
  userSession: {
    token?: string | null;
  };
};

const messages = defineMessages({
  accessibilityMenu: {
    id: 'headerBarAccessibilityMenu',
    defaultMessage: 'Menu de acessibilidade',
  },
  menuLabel: {
    id: 'headerBarMenuLabel',
    defaultMessage: 'MENU',
  },
});

/**
 * HeaderBar — the top utility bar above the main header.
 *
 * Features:
 * - Renders accessibility controls, language selector, theme toggle, user tools
 * - Auto-collapses into a dropdown when content overflows the available width
 * - Uses `SlotRenderer` for extensibility (`headerBarStart` / `headerBarEnd`)
 * - All sub-components are registered in `config.components` for easy override
 */
const HeaderBar: React.FC<HeaderBarProps> = ({
  content,
  navRoot,
  location,
}) => {
  const intl = useIntl();
  const token = useSelector(
    (state: RootState) => state.userSession?.token,
    shallowEqual,
  );
  const { headerBar } = config.settings?.scvlt || {};
  const display = headerBar?.display ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((isOpen) => !isOpen);
  }, []);

  const { shouldCollapse } = useAutoCollapse({
    containerRef,
    measurerRef,
    targetRef: actionsRef,
    reservedWidth: 32, // Allow a bit more breathing room for the flex gap
  });

  // Fecha dropdown quando sai do estado colapsado (ex: resize da janela)
  useEffect(() => {
    if (!shouldCollapse) {
      closeMenu();
    }
  }, [shouldCollapse, closeMenu]);

  // Fecha ao clicar fora do trigger e do menu, ou ao pressionar Escape
  const extraRefs = useMemo(() => [menuRef], []);
  useClickOutside(dropdownRef, closeMenu, isMenuOpen, extraRefs);

  if (!display) return null;

  return (
    <div className="header-bar-wrapper">
      <Container layout className="header-bar">
        <div className="header-bar__inner" ref={containerRef}>
          <SlotRenderer
            name="headerBarStart"
            content={content}
            navRoot={navRoot}
            location={location}
          />

          <div className="header-bar__social">
            <SlotRenderer
              name="followUs"
              content={content}
              location={location}
            />
          </div>

          {/* Invisible measurer — renders the full content to measure its natural width */}
          <div
            ref={measurerRef}
            className="header-bar__measurer"
            aria-hidden="true"
          >
            <div className="header-bar__actions">
              <HeaderBarActions token={token} />
            </div>
          </div>

          {/* Visible actions — either inline or collapsed */}
          <div
            ref={actionsRef}
            className={`header-bar__actions ${shouldCollapse ? 'is-collapsed' : ''}`}
          >
            {shouldCollapse ? (
              <div className="header-bar__collapsed-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="header-bar__collapsed-trigger"
                  onClick={toggleMenu}
                  aria-expanded={isMenuOpen}
                  aria-label={intl.formatMessage(messages.accessibilityMenu)}
                >
                  <span>{intl.formatMessage(messages.menuLabel)}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <HeaderBarActions token={token} />
            )}
          </div>

          <SlotRenderer
            name="headerBarEnd"
            content={content}
            navRoot={navRoot}
            location={location}
          />
        </div>
      </Container>

      {shouldCollapse && isMenuOpen && (
        <div
          className="header-bar__collapsed-menu"
          id="header-bar__dropdown-menu"
          ref={menuRef}
        >
          <div className="header-bar__collapsed-menu-inner">
            <HeaderBarActions token={token} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderBar;
