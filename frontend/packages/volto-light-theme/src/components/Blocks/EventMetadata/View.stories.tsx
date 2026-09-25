import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import View from './View';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

export default {
  title: 'Blocks/EventMetadata/View',
  component: View,
} as Meta;

const Template: StoryFn = (args) => {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
  });
  return (
    <Provider store={store}>
      <View data={{}} properties={args.properties} />
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  properties: {
    start: '2026-10-15T09:00:00+00:00',
    end: '2026-10-15T18:00:00+00:00',
    location: 'Convention Center',
    contact_name: 'John Doe',
    contact_phone: '+1 555-1234',
    contact_email: 'john@example.com',
    event_url: 'https://example.com',
  },
};
