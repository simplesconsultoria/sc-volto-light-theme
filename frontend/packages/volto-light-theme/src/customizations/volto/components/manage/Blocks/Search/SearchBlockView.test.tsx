import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';

import SearchBlockView from './SearchBlockView';

const { MockListingBody } = vi.hoisted(() => {
  return {
    MockListingBody: ({ data, id }: any) => (
      <div data-testid="listing-body" data-block-id={id}>
        <span data-testid="listing-theme">{data?.theme || 'no-theme'}</span>
        <span data-testid="listing-border-width">
          {data?.['--cardBorderWidth'] ||
            data?.styles?.['--cardBorderWidth'] ||
            'no-border'}
        </span>
        <span data-testid="listing-border-color">
          {data?.['--cardBorderColor'] ||
            data?.styles?.['--cardBorderColor'] ||
            'no-color'}
        </span>
      </div>
    ),
  };
});

vi.mock('@plone/volto/components/manage/Blocks/Listing/ListingBody', () => ({
  default: MockListingBody,
}));

vi.mock(
  '@kitconcept/volto-light-theme/components/Blocks/Listing/ListingBody',
  () => ({
    default: MockListingBody,
  }),
);

vi.mock(
  '@plone/volto/components/manage/Blocks/Search/layout/TopSideFacets',
  () => ({
    default: ({ children }: any) => (
      <div data-testid="top-side-facets">{children}</div>
    ),
  }),
);

vi.mock('@plone/volto/helpers/Extensions', () => ({
  withBlockExtensions: (Component: any) => (props: any) => (
    <Component {...props} />
  ),
}));

vi.mock('@plone/volto/components/manage/Blocks/Search/hocs', () => ({
  withSearch: () => (Component: any) => (props: any) => (
    <Component {...props} />
  ),
  withQueryString: (Component: any) => (props: any) => <Component {...props} />,
}));

vi.mock('@plone/volto/registry', () => ({
  default: {
    settings: {
      defaultPageSize: 20,
    },
    blocks: {
      blocksConfig: {
        listing: {
          variations: [
            { id: 'grid', title: 'Grid', isDefault: true },
            { id: 'default', title: 'Default' },
          ],
        },
        search: {
          variations: [
            {
              id: 'facetsTopSide',
              title: 'Facets on top',
              view: ({ children }: any) => (
                <div data-testid="top-facets-layout">{children}</div>
              ),
              isDefault: true,
            },
          ],
        },
      },
    },
  },
}));

const mockStore = configureStore();

describe('SearchBlockView Customization', () => {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
    breadcrumbs: { root: '/' },
  });

  it('renders safely without crashing when variation is undefined (SSR safety)', () => {
    const data = {
      '@type': 'search',
      listingBodyTemplate: 'grid',
    };

    const { getByTestId, container } = render(
      <Provider store={store}>
        <SearchBlockView
          id="search-1"
          data={data}
          variation={undefined as any}
        />
      </Provider>,
    );

    expect(getByTestId('listing-body')).toBeInTheDocument();
    expect(container.querySelector('.block.search')).toBeInTheDocument();
  });

  it('applies block width class correctly', () => {
    const data = {
      '@type': 'search',
      styles: {
        'blockWidth:noprefix': 'layout',
      },
    };

    const { container } = render(
      <Provider store={store}>
        <SearchBlockView id="search-2" data={data} />
      </Provider>,
    );

    const searchWrapper = container.querySelector('.block.search');
    expect(searchWrapper).toHaveClass('has--block-width--layout');
  });

  it('applies block theme and forwards theme and color groups to ListingBody', () => {
    const data = {
      '@type': 'search',
      theme: 'custom-primary-accent',
      styles: {
        theme: 'custom-primary-accent',
        backColorGroup: 'primary',
        frontColorGroup: 'accent',
      },
    };

    const { container, getByTestId } = render(
      <Provider store={store}>
        <SearchBlockView id="search-3" data={data} />
      </Provider>,
    );

    const searchWrapper = container.querySelector('.block.search');
    expect(searchWrapper).toHaveClass('has-theme');
    expect(getByTestId('listing-theme')).toHaveTextContent(
      'custom-primary-accent',
    );
  });

  it('applies card border styles to container and forwards to ListingBody', () => {
    const data = {
      '@type': 'search',
      styles: {
        '--cardBorderWidth': '2px',
        '--cardBorderColor': '#f4822c',
      },
    };

    const { container, getByTestId } = render(
      <Provider store={store}>
        <SearchBlockView id="search-4" data={data} />
      </Provider>,
    );

    const searchWrapper = container.querySelector('.block.search');
    expect(searchWrapper).toHaveStyle({
      '--cardBorderWidth': '2px',
      '--cardBorderColor': '#f4822c',
    });
    expect(getByTestId('listing-border-width')).toHaveTextContent('2px');
    expect(getByTestId('listing-border-color')).toHaveTextContent('#f4822c');
  });
});
