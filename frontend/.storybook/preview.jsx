import '@plone/volto/config'; // This is the bootstrap for the global config - client side
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import enMessages from '@root/../locales/en.json';

import '@root/theme';

import {
  globalTypes as themeGlobalTypes,
  withTheme,
} from '@simplesconsultoria/volto-light-theme/storybook/withTheme';

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const globalTypes = themeGlobalTypes;

export const decorators = [
  withTheme,
  (Story) => (
    <IntlProvider messages={enMessages} locale="en" defaultLocale="en">
      <StaticRouter location="/">
        <Story />
      </StaticRouter>
    </IntlProvider>
  ),
];
