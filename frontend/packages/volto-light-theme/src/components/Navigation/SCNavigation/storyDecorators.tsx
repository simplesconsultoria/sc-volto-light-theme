import React from 'react';
import type { Decorator } from '@storybook/react';

/**
 * Shared decorators for the Navigation component stories.
 *
 * They render the story inside a centered container and the
 * `#navigation.navigation` scope so the SCSS in `_navigation.scss` applies,
 * on the same background/foreground the theme uses for the header.
 */

const wrapperStyle: React.CSSProperties = {
  maxWidth: 'var(--layout-container-width)',
  margin: '0 auto',
  backgroundColor: 'var(--header-background)',
  color: 'var(--header-foreground)',
};

/**
 * The container + navigation scope. `children` lets each story supply the
 * inner markup (`ul.desktop-menu`, `.submenu-items`, ...) its component
 * expects to be nested in.
 */
export const NavigationCanvas = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div style={wrapperStyle}>
    <nav id="navigation" className="navigation" style={{ padding: 24 }}>
      {children}
    </nav>
  </div>
);

/** Default decorator: the story rendered directly inside the navigation scope. */
export const withNavigationTheme: Decorator = (Story) => (
  <NavigationCanvas>
    <Story />
  </NavigationCanvas>
);
