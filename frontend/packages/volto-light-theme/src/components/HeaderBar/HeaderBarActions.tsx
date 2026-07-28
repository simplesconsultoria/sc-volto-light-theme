import React, { memo } from 'react';
import config from '@plone/volto/registry';
import Anontools from '@plone/volto/components/theme/Anontools/Anontools';
import LanguageSelector from '@plone/volto/components/theme/LanguageSelector/LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import AccessibilityControls from '../AccessibilityControls/AccessibilityControls';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import HeaderBarActionsUI from './HeaderBarActionsUI';

type HeaderBarActionsProps = {
  token?: string | null;
  className?: string | null;
};

const HeaderBarActions: React.FC<HeaderBarActionsProps> = ({
  token,
  className,
}) => {
  const { headerBar } = config.settings?.scvlt || {};
  const quickLinks = headerBar?.quickLinks ?? [];
  const languageSelector = headerBar?.elements?.languageSelector ?? false;
  const themeToggle = headerBar?.elements?.themeToggle ?? false;
  const accessibilityControls =
    headerBar?.elements?.accessibilityControls ?? false;
  const userTools = headerBar?.elements?.userTools ?? false;

  return (
    <HeaderBarActionsUI
      token={token}
      className={className}
      quickLinks={quickLinks}
      features={{
        languageSelector,
        themeToggle,
        accessibilityControls,
        userTools: userTools && !token,
      }}
      LinkComponent={UniversalLink}
      LanguageSelectorComponent={LanguageSelector}
      ThemeToggleComponent={ThemeToggle}
      AccessibilityControlsComponent={AccessibilityControls}
      AnontoolsComponent={Anontools}
    />
  );
};

export default memo(HeaderBarActions);
