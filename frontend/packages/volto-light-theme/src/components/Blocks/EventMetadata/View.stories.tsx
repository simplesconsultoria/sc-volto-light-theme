import React from 'react';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import View from './View';
import { matrixStory, withBlockStore } from '../../../storybook/blockStyling';
import { eventContent } from '../../../storybook/viewFixtures';
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

/*
 * Theme, width and border reach the block through `RenderBlocks`, not through
 * `View`'s props, so these render through it against the Event content item
 * from `viewFixtures`, which carries the schedule and contact fields.
 */
const event = { data: { '@type': 'eventMetadata' }, content: eventContent };
const withEvent = [withBlockStore({ content: eventContent })];

export const Themes: StoryObj = {
  ...matrixStory('theme', event),
  decorators: withEvent,
};

export const Widths: StoryObj = {
  ...matrixStory('width', event),
  decorators: withEvent,
};

export const Borders: StoryObj = {
  ...matrixStory('border', event),
  decorators: withEvent,
};
