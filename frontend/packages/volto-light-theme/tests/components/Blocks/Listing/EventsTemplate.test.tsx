import React from 'react';
import { renderWithIntl as render } from '../../../support/intl';
import EventsTemplate from '@simplesconsultoria/volto-light-theme/components/Blocks/Listing/EventsTemplate';
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

  it('falls back to translated labels', () => {
    const store = mockStore({ content: { subrequests: {} } });
    const items = [
      {
        '@id': '/event2',
        '@type': 'Event',
        title: 'No Subject',
        start: '2026-09-24T16:00:00+00:00',
        location: 'Somewhere',
      },
    ];

    const { getByText, queryByText } = render(
      <Provider store={store}>
        <EventsTemplate items={items} isEditMode={false} linkHref="/all" />
      </Provider>,
    );

    expect(getByText('Event')).toBeInTheDocument();
    expect(getByText('View all')).toBeInTheDocument();
    expect(queryByText('Evento')).not.toBeInTheDocument();
    expect(queryByText('Ver todos')).not.toBeInTheDocument();
  });
});
