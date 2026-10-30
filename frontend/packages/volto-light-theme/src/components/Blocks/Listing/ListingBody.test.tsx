import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider, createIntl } from 'react-intl';
import { ListingBody } from './ListingBody';

vi.mock('@plone/volto/components/theme/SlotRenderer/SlotRenderer', () => ({
  default: () => null,
}));
vi.mock(
  '@plone/volto/components/manage/ConditionalLink/ConditionalLink',
  () => ({
    default: ({ children }: any) => <div>{children}</div>,
  }),
);
vi.mock('@plone/volto-slate/editor/render', () => ({
  renderLinkElement: () => () => null,
}));
vi.mock(
  '@plone/volto/components/manage/Blocks/Listing/withQuerystringResults',
  () => ({ default: (Component: any) => Component }),
);

const intl = createIntl({ locale: 'en', messages: {} });

const renderListing = (data: Record<string, unknown>, totalPages: number) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <ListingBody
        data={data}
        listingItems={[{ '@id': '/item' }]}
        variation={{ template: () => <div>items</div> }}
        totalPages={totalPages}
        currentPage={1}
        batch_size={10}
        onPaginationChange={() => {}}
        intl={intl}
      />
    </IntlProvider>,
  );

describe('ListingBody pagination', () => {
  it.each(['.desktop-pagination', '.mobile-pagination'])(
    'labels %s with the headline',
    (selector) => {
      const { container } = renderListing({ headline: 'News' }, 3);

      expect(container.querySelector(selector)).toHaveAttribute(
        'aria-label',
        'Pagination Navigation for News',
      );
    },
  );

  it.each(['.desktop-pagination', '.mobile-pagination'])(
    'labels %s without a headline',
    (selector) => {
      const { container } = renderListing({}, 3);

      expect(container.querySelector(selector)).toHaveAttribute(
        'aria-label',
        'Pagination Navigation',
      );
    },
  );

  it('renders no pagination for a single page', () => {
    const { container } = renderListing({ headline: 'News' }, 1);

    expect(container.querySelector('.pagination-wrapper')).toBeNull();
  });
});
