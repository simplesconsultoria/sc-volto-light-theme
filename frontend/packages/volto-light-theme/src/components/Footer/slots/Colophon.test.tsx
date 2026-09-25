import React from 'react';
import { render } from '@testing-library/react';
import Colophon from './Colophon';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';

const mockStore = configureStore();

vi.mock('@plone/volto/registry', () => ({
  default: {
    widgets: {
      views: {
        widget: {
          slate_richtext: ({ value }: any) => (
            <div className="slate-richtext">{JSON.stringify(value)}</div>
          ),
        },
      },
    },
  },
}));

vi.mock(
  '@kitconcept/volto-light-theme/components/Footer/slots/Copyright',
  () => ({ default: () => <div className="copyright">Copyright</div> }),
);
vi.mock('@kitconcept/volto-light-theme/components/Logo/Logo', () => ({
  default: () => <div className="logo">Logo</div>,
}));

describe('Colophon', () => {
  it('renders standard layout without config', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
      form: { global: {} },
    });

    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Colophon content={{}} />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      getByText('Powered by Plone and Volto Light Theme'),
    ).toBeInTheDocument();
  });
});
