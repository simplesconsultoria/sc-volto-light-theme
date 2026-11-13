import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from '../../../storybook/blockStyling';

/**
 * The search block, through this package's `SearchBlockView` — the
 * replacement `config/blocks.ts` installs, which resolves the theme, width and
 * border itself and passes them on to `ListingBody`.
 *
 * `withSearch` dispatches a thunk on mount, so the block needs the real store;
 * there is no backend behind the fetch, so the results area stays empty. These
 * stories show the frame: the search input, the facet layout, the sort and view
 * controls, and the block styling around them.
 *
 * Its own controls: the `facetsTopSide`, `facetsLeftSide` and `facetsRightSide`
 * variations, `showSearchInput`, `showSortOn`, and `listingBodyTemplate` (any
 * listing variation).
 */

const search = (variation: string, extra: Record<string, any> = {}) => ({
  '@type': 'search',
  variation,
  headline: 'Search the news',
  showSearchInput: true,
  showSearchButton: true,
  showSortOn: true,
  sortOnOptions: ['effective', 'sortable_title'],
  listingBodyTemplate: 'grid',
  query: {
    query: [
      {
        i: 'portal_type',
        o: 'plone.app.querystring.operation.selection.any',
        v: ['News Item'],
      },
    ],
    sort_on: 'effective',
    sort_order: 'descending',
  },
  facets: [
    {
      '@id': 'facet-type',
      title: 'Type',
      field: { label: 'Type', value: 'portal_type' },
      type: 'checkboxFacet',
    },
  ],
  ...extra,
});

const meta = {
  title: 'Blocks/Search',
  component: StyledBlock,
  decorators: [withBlockStore({ real: true })],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: search('facetsTopSide') },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FacetsTop: Story = {};

export const FacetsLeft: Story = {
  args: { data: search('facetsLeftSide') },
};

export const FacetsRight: Story = {
  args: { data: search('facetsRightSide') },
};

/** No input, no sort: a filtered listing. */
export const FacetsOnly: Story = {
  args: {
    data: search('facetsTopSide', {
      showSearchInput: false,
      showSortOn: false,
    }),
  },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
