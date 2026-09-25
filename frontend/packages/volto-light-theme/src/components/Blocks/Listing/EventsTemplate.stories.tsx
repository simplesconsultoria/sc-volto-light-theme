import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import EventsTemplate from './EventsTemplate';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

/**
 * EventsTemplate component used for Listing block events variation.
 * Displays a clean and structured list of events with dates and locations.
 */
export default {
  title: 'Blocks/Listing/EventsTemplate',
  component: EventsTemplate,
} as Meta;

const Template: StoryFn = (args) => {
  const store = mockStore({
    content: { subrequests: {} },
  });
  return (
    <Provider store={store}>
      <EventsTemplate items={args.items} isEditMode={false} />
    </Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      '@id': '/event1',
      '@type': 'Event',
      title: 'Annual Conference',
      description: 'Join us for the annual conference.',
      start: '2026-10-15T09:00:00+00:00',
      location: 'Convention Center',
    },
    {
      '@id': '/event2',
      '@type': 'Event',
      title: 'Team Meetup',
      description: 'Monthly team meetup and discussion.',
      start: '2026-11-02T18:00:00+00:00',
      location: 'Main Office',
    },
  ],
};
