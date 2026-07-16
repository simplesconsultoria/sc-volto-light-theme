import React from 'react';
import config from '@plone/volto/registry';
import Anontools from '@plone/volto/components/theme/Anontools/Anontools';
import LanguageSelector from '@plone/volto/components/theme/LanguageSelector/LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import AccessibilityControls from '../AccessibilityControls/AccessibilityControls';

type HeaderBarActionsProps = {
  token?: string | null;
  className?: string | null;
};

const HeaderBarActions: React.FC<HeaderBarActionsProps> = ({
  token,
  className,
}) => {
  const { headerBar } = config.settings?.scvlt || {};
  const languageSelector = headerBar?.elements?.languageSelector ?? false;
  const themeToggle = headerBar?.elements?.themeToggle ?? false;
  const accessibilityControls =
    headerBar?.elements?.accessibilityControls ?? false;
  const userTools = headerBar?.elements?.userTools ?? false;
  const classNameValue = className ? `${className}` : 'header-bar__actions';

  return (
    <div className={classNameValue}>
      {languageSelector && <LanguageSelector />}
      {themeToggle && <ThemeToggle />}
      {accessibilityControls && <AccessibilityControls />}
      {userTools && (
        <div className="header-bar__actions__user">
          {!token && <Anontools />}
        </div>
      )}
    </div>
  );
};

export default HeaderBarActions;
