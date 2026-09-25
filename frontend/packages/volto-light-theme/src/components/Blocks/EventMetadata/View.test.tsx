import React from 'react';
import { render } from '@testing-library/react';
import View from './View';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

describe('EventMetadata View', () => {
  it('renders event metadata correctly', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const properties = {
      start: '2026-09-24T16:00:00+00:00',
      end: '2026-09-24T18:00:00+00:00',
      location: 'Curitiba',
      contact_name: 'Contact Name',
      contact_phone: '123456789',
      contact_email: 'test@test.com',
      event_url: 'http://test.com',
    };

    const { getByText } = render(
      <Provider store={store}>
        <View data={{}} properties={properties} />
      </Provider>,
    );

    expect(getByText('Curitiba')).toBeInTheDocument();
    expect(getByText('Contact Name')).toBeInTheDocument();
  });
});
