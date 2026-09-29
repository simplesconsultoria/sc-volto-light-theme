import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import Colophon from './Colophon';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';

import config from '@plone/volto/registry';

const mockStore = configureStore();

// Mock the slate_richtext widget config so it doesn't crash in Storybook
config.widgets = {
  ...config.widgets,
  views: {
    ...config.widgets?.views,
    widget: {
      ...config.widgets?.views?.widget,
      slate_richtext: ({ value }: any) => (
        <div className="slate-mock">{JSON.stringify(value)}</div>
      ),
    },
  },
};

/**
 * Colophon component for the footer slot.
 * Renders copyright info, logo, and additional colophon text.
 */
export default {
  title: 'Slots/Colophon',
  component: Colophon,
} as Meta;

const Template: StoryFn = (args) => {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
    form: { global: {} },
    site: { data: {} },
    navroot: { data: {} },
    content: { data: {} },
  });
  return (
    <Provider store={store}>
      <Colophon content={{}} {...args} />
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {};
