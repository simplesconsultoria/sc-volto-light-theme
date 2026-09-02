import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import CarouselTemplate from './CarouselTemplate';
import { listingItems, singleItem } from './fixtures';

/**
 * `_listing.scss` is scoped to `body .block.listing`, and the variation rules to
 * `&.carousel`, so the template has to sit inside the same wrapper the listing
 * block renders on a page — otherwise none of its styling applies, including the
 * focus outlines on cards.
 */
const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous>
    <div style={{ padding: '2rem' }}>
      <div className="block listing carousel">
        <Story />
      </div>
    </div>
  </Wrapper>
);

const meta = {
  title: 'Public/Blocks/Listing/Carousel',
  component: CarouselTemplate,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    carouselObjectFit: {
      control: { type: 'inline-radio' },
      options: ['contain', 'cover'],
    },
    carouselMaxHeight: {
      control: { type: 'range', min: 200, max: 1200, step: 20 },
    },
  },
} satisfies Meta<typeof CarouselTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: listingItems,
    carouselMaxHeight: 520,
    carouselObjectFit: 'cover',
    carouselObjectPosition: 'center center',
  },
};

/** `contain` leaves bands at the sides rather than cropping. */
export const Contain: Story = {
  args: { ...Default.args, carouselObjectFit: 'contain' },
};

/** Auto-advance adds the play/pause control to the toolbar. */
export const AutoPlay: Story = {
  args: {
    ...Default.args,
    carouselAutoPlay: true,
    carouselAutoPlayInterval: 6000,
  },
};

export const WithHeadlineLink: Story = {
  args: {
    ...Default.args,
    linkTitle: 'See all news',
    linkHref: [{ '@id': '/news' }],
  },
};

/** A single slide still renders the dot strip, with navigation a no-op. */
export const SingleItem: Story = {
  args: { ...Default.args, items: singleItem },
};
