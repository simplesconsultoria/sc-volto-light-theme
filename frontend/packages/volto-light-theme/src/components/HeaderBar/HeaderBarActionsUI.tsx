import React, { memo } from 'react';
import cx from 'classnames';

export type HeaderBarActionsUIProps = {
  token?: string | null;
  className?: string | null;
  quickLinks?: any[];
  features?: {
    languageSelector?: boolean;
    themeToggle?: boolean;
    accessibilityControls?: boolean;
    userTools?: boolean;
  };
  LinkComponent?: React.ElementType;
  LanguageSelectorComponent?: React.ElementType;
  ThemeToggleComponent?: React.ElementType;
  AccessibilityControlsComponent?: React.ElementType;
  AnontoolsComponent?: React.ElementType;
};

const HeaderBarActionsUI: React.FC<HeaderBarActionsUIProps> = ({
  token,
  className,
  quickLinks = [],
  features = {},
  LinkComponent = 'a',
  LanguageSelectorComponent,
  ThemeToggleComponent,
  AccessibilityControlsComponent,
  AnontoolsComponent,
}) => {
  const classNameValue = cx('header-bar__actions__tools', className);
  const {
    languageSelector = false,
    themeToggle = false,
    accessibilityControls = false,
    userTools = false,
  } = features;

  return (
    <div className={classNameValue}>
      {quickLinks.length > 0 && (
        <div className="header-bar__mock-links">
          {quickLinks.map((link) => {
            const itemKey = link.id || link.href || link.label;
            if (link.component) {
              const CustomComponent = link.component;
              return <CustomComponent key={itemKey} {...link} />;
            }
            return (
              <LinkComponent
                key={itemKey}
                href={link.href!}
                className="quick-link"
              >
                {link.label}
              </LinkComponent>
            );
          })}
        </div>
      )}

      {languageSelector && LanguageSelectorComponent && (
        <LanguageSelectorComponent />
      )}
      {themeToggle && ThemeToggleComponent && <ThemeToggleComponent />}
      {accessibilityControls && AccessibilityControlsComponent && (
        <AccessibilityControlsComponent />
      )}
      {userTools && AnontoolsComponent && (
        <div className="header-bar__actions__user">
          <AnontoolsComponent />
        </div>
      )}
    </div>
  );
};

export default memo(HeaderBarActionsUI);
