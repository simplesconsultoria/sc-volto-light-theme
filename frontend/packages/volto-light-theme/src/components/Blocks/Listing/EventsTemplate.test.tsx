import React from 'react';
import { render } from '@testing-library/react';
import EventsTemplate from './EventsTemplate';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

vi.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock(
  '@plone/volto/components/manage/ConditionalLink/ConditionalLink',
  () => ({ default: ({ children }: any) => <div>{children}</div> }),
);

describe('EventsTemplate', () => {
  it('renders events correctly', () => {
    const store = mockStore({
      content: { subrequests: {} },
    });

    const items = [
      {
        '@id': '/evento1',
        '@type': 'Event',
        title: 'Test Event',
        description: 'Test Description',
        start: '2026-09-24T16:00:00+00:00',
        location: 'Test Location',
      },
    ];

    const { getByText } = render(
      <Provider store={store}>
        <EventsTemplate
          items={items}
          isEditMode={false}
          linkTitle="All"
          linkHref="/all"
          blockWidth="full"
        />
      </Provider>,
    );

    expect(getByText('Test Event')).toBeInTheDocument();
    expect(getByText('Test Location')).toBeInTheDocument();
  });
});
