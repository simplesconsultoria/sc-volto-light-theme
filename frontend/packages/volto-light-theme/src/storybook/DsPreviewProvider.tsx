import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import { createThemeDefinition } from '../config/blockThemes';

/**
 * The context a Claude Design preview needs, as a single bundle export.
 *
 * The converter normally bundles `.storybook/preview`'s decorators to wrap
 * previews, but ours import Volto build aliases (`@root/../locales/en.json`,
 * `@plone/volto/config`) that esbuild cannot resolve, so the decorator bundle
 * fails and `cfg.provider` has to supply the same context instead.
 *
 * It reproduces what `withTheme` gives a story at its default toolbar settings
 * — light mode on the root element *and* on the wrapper, the `default` block
 * theme's `--theme-*` properties, and the container measure — plus the two
 * providers the global decorators add. See `withTheme.tsx` for why the colour
 * mode has to be set in both places.
 *
 * Messages are deliberately empty: with no catalogue, `react-intl` falls back to
 * each message's `defaultMessage`, which is the English text the storybook shows.
 */
export default function DsPreviewProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }, []);

  const style = {
    colorScheme: 'light',
    background: 'var(--primary-color)',
    color: 'var(--primary-foreground-color)',
    ...createThemeDefinition('default', 'default').style,
  } as React.CSSProperties;

  return (
    <IntlProvider messages={{}} locale="en" defaultLocale="en">
      <MemoryRouter initialEntries={['/']}>
        <div style={style}>
          <div
            style={{
              maxWidth: 'var(--default-container-width)',
              margin: '0 auto',
            }}
          >
            {children}
          </div>
        </div>
      </MemoryRouter>
    </IntlProvider>
  );
}
