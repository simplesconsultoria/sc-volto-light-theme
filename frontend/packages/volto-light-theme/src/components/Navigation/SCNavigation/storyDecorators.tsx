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
 * Just the themed ground, for `SCNavigation` itself — it renders its own
 * `#navigation.navigation.scNavigation` element, so wrapping it in a second one
 * would duplicate the id.
 */
export const NavigationGround = ({
  children,
}: {
  children: React.ReactNode;
}) => <div style={wrapperStyle}>{children}</div>;

/**
 * The container + navigation scope, for the sub-components. `children` lets each
 * story supply the inner markup (`ul.desktop-menu`, `.submenu-items`, ...) its
 * component expects to be nested in.
 *
 * The class list matters: `_navigation.scss` nests everything under
 * `#navigation.navigation` **and** `&.scNavigation`, so all three selectors have
 * to be present. Without `scNavigation` the rules silently miss — the fat menu
 * still renders its content, but `.submenu-items` never becomes the two-column
 * grid and the links keep the browser's default colour.
 */
export const NavigationCanvas = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div style={wrapperStyle}>
    <nav
      id="navigation"
      className="navigation scNavigation"
      style={{ padding: 24 }}
    >
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
