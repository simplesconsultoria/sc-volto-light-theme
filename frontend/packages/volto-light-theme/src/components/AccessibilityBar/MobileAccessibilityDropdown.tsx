import React, { useState, useRef, useEffect } from 'react';
import Anontools from '@plone/volto/components/theme/Anontools/Anontools';
import LanguageSelector from '@plone/volto/components/theme/LanguageSelector/LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import AccessibilityControls from './AccessibilityControls';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import moreIcon from '@plone/volto/icons/more.svg';

type MobileAccessibilityDropdownProps = {
  token?: string | null;
};

const MobileAccessibilityDropdown: React.FC<
  MobileAccessibilityDropdownProps
> = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mobile-accessibility-dropdown" ref={dropdownRef}>
      <button
        className="mobile-accessibility-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Opções de Acessibilidade"
      >
        <Icon name={moreIcon} size="30px" />
      </button>

      {isOpen && (
        <div className="mobile-accessibility-menu">
          <div className="mobile-accessibility-menu-inner">
            <LanguageSelector />
            <ThemeToggle />
            <AccessibilityControls />
            {token && (
              <div className="header-accessibility__tools">
                <Anontools />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAccessibilityDropdown;
