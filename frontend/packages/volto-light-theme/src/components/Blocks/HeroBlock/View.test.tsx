import React from 'react';
import { render } from '@testing-library/react';
import View from './View';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';

import { vi } from 'vitest';

const mockStore = configureStore();

vi.mock('@plone/volto/registry', () => ({
  default: {
    blocks: {
      blocksConfig: {
        heroBlock: {
          themes: [
            { name: 'default', style: { '--theme-color': 'red' } },
            { name: 'brand', style: { '--theme-color': 'blue' } },
          ],
        },
      },
    },
  },
}));

// Mock the BlockWrapper
vi.mock('@kitconcept/volto-bm3-compat', () => ({
  BlockWrapper: ({ children }: any) => (
    <div className="mock-block-wrapper">{children}</div>
  ),
}));

describe('HeroBlock View', () => {
  it('renders flex variation correctly', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const data = {
      '@type': 'heroBlock',
      variation: 'flex',
      title: 'Flex Title',
    };

    const { getByText, container } = render(
      <Provider store={store}>
        <View data={data} />
      </Provider>,
    );

    expect(getByText('Flex Title')).toBeInTheDocument();
    expect(
      container.querySelector('.hero-block-container'),
    ).toBeInTheDocument();
  });

  it('renders card variation correctly', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const data = {
      '@type': 'heroBlock',
      variation: 'card',
      title: 'Card Title',
    };

    const { getByText, container } = render(
      <Provider store={store}>
        <View data={data} />
      </Provider>,
    );

    expect(getByText('Card Title')).toBeInTheDocument();
    expect(
      container.querySelector('.hero-block-container'),
    ).toBeInTheDocument();
  });

  it('applies theme correctly', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const data = {
      '@type': 'heroBlock',
      theme: 'brand',
      title: 'Brand Title',
    };

    const { container } = render(
      <Provider store={store}>
        <View data={data} />
      </Provider>,
    );

    const block = container.querySelector('.hero-block-container');
    expect(block).toHaveStyle('--theme-color: blue');
  });
});
