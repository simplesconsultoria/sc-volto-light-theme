import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import Colophon from './Colophon';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

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
  });
  return (
    <Provider store={store}>
      <Colophon content={{}} {...args} />
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {};
