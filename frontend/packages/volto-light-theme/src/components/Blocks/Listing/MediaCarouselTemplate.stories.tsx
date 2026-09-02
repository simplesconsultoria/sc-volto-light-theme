import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import MediaCarouselTemplate from './MediaCarouselTemplate';
import { mediaItems, listingItems } from './fixtures';

/**
 * `_listing.scss` is scoped to `body .block.listing`, and the variation rules to
 * `&.mediaCarousel`, so the template has to sit inside the same wrapper the listing
 * block renders on a page — otherwise none of its styling applies, including the
 * focus outlines on cards.
 */
const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous>
    <div style={{ padding: '2rem' }}>
      <div className="block listing mediaCarousel">
        <Story />
      </div>
    </div>
  </Wrapper>
);

const meta = {
  title: 'Public/Blocks/Listing/Media Carousel',
  component: MediaCarouselTemplate,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof MediaCarouselTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mixed media: the first two items carry a `videoUrl`, the third does not. */
export const Default: Story = {
  args: {
    items: mediaItems,
    carouselMaxHeight: 520,
    carouselObjectFit: 'cover',
    carouselObjectPosition: 'center center',
  },
};

/** No `videoUrl` anywhere, so every slide falls back to its preview image. */
export const ImagesOnly: Story = {
  args: { ...Default.args, items: listingItems.slice(0, 3) },
};

export const AutoPlay: Story = {
  args: {
    ...Default.args,
    carouselAutoPlay: true,
    carouselAutoPlayInterval: 6000,
  },
};
