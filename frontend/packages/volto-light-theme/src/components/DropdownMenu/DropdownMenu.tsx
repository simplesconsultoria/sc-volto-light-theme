import React, { useState, useRef, useEffect, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';

export type DropdownLink = {
  title: string;
  href: string;
};

export type DropdownMenuProps = {
  /** Button label shown next to the icon/caret. */
  title?: string;
  /** Optional Volto SVG icon for the button. */
  icon?: React.ReactNode;
  /** Pre-built list of links to render as <ul>. */
  links?: DropdownLink[];
  /** Arbitrary content rendered inside the dropdown panel (overrides `links`). */
  children?: React.ReactNode;
  /** Extra className on the root element. */
  className?: string;
  /** Link component to render links. Defaults to UniversalLink. */
  LinkComponent?: React.ElementType;
};

const messages = defineMessages({
  toggleMenu: {
    id: 'dropdownMenuToggle',
    defaultMessage: 'Toggle menu',
  },
});

/**
 * Generic dropdown menu component.
 *
 * Can render either a list of `links` or arbitrary `children` inside the panel.
 * Supports keyboard (Escape) and click-outside dismissal.
 *
 * Registered in `config.components` as `DropdownMenu` so projects can
 * override it without shadowing.
 */
const DropdownMenu: React.FC<DropdownMenuProps> = ({
  title,
  icon,
  links,
  children,
  className = '',
  LinkComponent = UniversalLink,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  // Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, close]);

  const hasContent = children || (links && links.length > 0);

  return (
    <div
      className={`sc-dropdown-menu ${isOpen ? 'is-open' : ''} ${className}`}
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="sc-dropdown-menu__trigger"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={title || intl.formatMessage(messages.toggleMenu)}
      >
        {icon && <span className="sc-dropdown-menu__icon">{icon}</span>}
        {title && <span className="sc-dropdown-menu__title">{title}</span>}
        <svg
          className={`sc-dropdown-menu__caret ${isOpen ? 'is-open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </button>

      {isOpen && hasContent && (
        <div className="sc-dropdown-menu__panel">
          {children ? (
            children
          ) : (
            <ul className="sc-dropdown-menu__list">
              {links!.map((link, idx) => (
                <li key={link.title + idx} className="sc-dropdown-menu__item">
                  <LinkComponent href={link.href} onClick={close}>
                    {link.title}
                  </LinkComponent>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
