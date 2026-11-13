import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from '../../../storybook/blockStyling';
import { listingItems } from './fixtures';

/**
 * The whole listing block, through `RenderBlocks` and this package's
 * `ListingBody`.
 *
 * The template stories beside this file render one template in isolation, which
 * shows its markup but none of the block styling — `ListingBody` is what
 * resolves the theme, the width and the border and hands them down. These show
 * every variation the block offers on this site, then the styling matrix on the
 * grid.
 *
 * Results come from the store (`withBlockStore` seeds
 * `querystringsearch.subrequests` for each block id), so no backend is needed.
 */

const listing = (variation: string, extra: Record<string, any> = {}) => ({
  '@type': 'listing',
  variation,
  headline: 'Latest from the council',
  headlineTag: 'h2',
  querystring: {
    query: [
      {
        i: 'portal_type',
        o: 'plone.app.querystring.operation.selection.any',
        v: ['News Item', 'Document', 'Event', 'File'],
      },
    ],
  },
  ...extra,
});

const events = listingItems.map((item, i) => ({
  ...item,
  '@type': 'Event',
  start: `2026-12-${String(i * 3 + 2).padStart(2, '0')}T09:00:00+00:00`,
  end: `2026-12-${String(i * 3 + 2).padStart(2, '0')}T17:00:00+00:00`,
}));

const meta = {
  title: 'Blocks/Listing/Listing Block',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: listing('grid', { gridColumns: 3 }) },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `default`, relabelled "List" by upstream VLT. */
export const List: Story = { args: { data: listing('default') } };

/** `summary`, relabelled "List with images". */
export const ListWithImages: Story = { args: { data: listing('summary') } };

export const Grid: Story = {};

export const GridFourColumns: Story = {
  args: { data: listing('grid', { gridColumns: 4 }) },
};

export const ImageGallery: Story = {
  args: { data: listing('imageGallery') },
};

export const Carousel: Story = { args: { data: listing('carousel') } };

export const MediaCarousel: Story = {
  args: { data: listing('mediaCarousel') },
};

/** The `teaser` variation, titled "Highlight" in the editor. */
export const Highlight: Story = { args: { data: listing('teaser') } };

export const Events: Story = { args: { data: listing('events') } };

/** The calendar template: each event with its date inset. */
export const EventCalendar: Story = {
  args: { data: listing('eventCalendar') },
  decorators: [withBlockStore({ items: events })],
};

/**
 * Events mixed with items that have no dates (a page, a file). Upstream threw
 * on these; the shadowed `EventTemplate` renders them as plain cards.
 */
export const EventCalendarMixedItems: Story = {
  args: { data: listing('eventCalendar') },
  decorators: [
    withBlockStore({
      items: [...events.slice(0, 2), ...listingItems.slice(2)],
    }),
  ],
};

/** A headline link, which the grid and carousel templates render. */
export const WithHeadlineLink: Story = {
  args: {
    data: listing('grid', {
      gridColumns: 3,
      linkTitle: 'See all news',
      linkHref: [{ '@id': '/news', title: 'News' }],
    }),
  },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
export const BackgroundLayers: Story = matrixStory('layer');

/** The matrix again on a second template, since each styles its cards itself. */
export const CarouselThemes: Story = {
  ...matrixStory('theme'),
  args: { data: listing('carousel') },
};
