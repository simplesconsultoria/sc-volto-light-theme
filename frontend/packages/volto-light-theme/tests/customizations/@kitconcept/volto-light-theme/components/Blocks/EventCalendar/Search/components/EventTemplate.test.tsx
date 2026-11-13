import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import EventCalendarTemplate, {
  eventDates,
} from '@simplesconsultoria/volto-light-theme/customizations/@kitconcept/volto-light-theme/components/Blocks/EventCalendar/Search/components/EventTemplate';

const mockStore = configureStore();

const renderTemplate = (items: any[]) =>
  render(
    <Provider store={mockStore({ intl: { locale: 'en', messages: {} } })}>
      <MemoryRouter>
        <EventCalendarTemplate items={items} isEditMode={false} />
      </MemoryRouter>
    </Provider>,
  );

describe('eventDates', () => {
  it('is null without a usable date', () => {
    expect(eventDates({})).toBeNull();
    expect(eventDates({ start: 'not a date' })).toBeNull();
  });

  it('uses the start, and the end when it is another day', () => {
    const dates = eventDates({
      start: '2026-11-10T10:00:00',
      end: '2026-11-12T10:00:00',
    });
    expect(dates?.first.getDate()).toBe(10);
    expect(dates?.last?.getDate()).toBe(12);
    expect(dates?.notSameDay).toBe(true);
  });

  it('falls back to the end when there is no start', () => {
    const dates = eventDates({ end: '2026-11-12T10:00:00' });
    expect(dates?.first.getDate()).toBe(12);
    expect(dates?.last).toBeNull();
  });
});

describe('EventCalendarTemplate', () => {
  it('renders items without a start date instead of crashing', () => {
    const { container, getByText } = renderTemplate([
      {
        '@id': '/event',
        '@type': 'Event',
        title: 'An event',
        start: '2026-11-10T10:00:00',
        end: '2026-11-10T12:00:00',
      },
      { '@id': '/page', '@type': 'Document', title: 'A page' },
    ]);
    expect(getByText('An event')).toBeTruthy();
    expect(getByText('A page')).toBeTruthy();
    // Only the dated item gets the date inset
    expect(container.querySelectorAll('.date-inset')).toHaveLength(1);
  });
});
