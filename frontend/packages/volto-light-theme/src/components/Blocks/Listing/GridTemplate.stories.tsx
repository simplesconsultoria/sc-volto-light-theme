import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import GridTemplate from './GridTemplate';
import { listingItems, singleItem } from './fixtures';

/**
 * `_listing.scss` is scoped to `body .block.listing`, and the variation rules to
 * `&.grid`, so the template has to sit inside the same wrapper the listing
 * block renders on a page — otherwise none of its styling applies, including the
 * focus outlines on cards.
 */
const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous>
    <div style={{ padding: '2rem' }}>
      <div className="block listing grid">
        <Story />
      </div>
    </div>
  </Wrapper>
);

const meta = {
  title: 'Public/Blocks/Listing/Grid',
  component: GridTemplate,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    gridColumns: { control: { type: 'inline-radio' }, options: [1, 2, 3, 4] },
  },
} satisfies Meta<typeof GridTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {
  args: { items: listingItems, gridColumns: 3 },
};

export const TwoColumns: Story = {
  args: { items: listingItems, gridColumns: 2 },
};

export const FourColumns: Story = {
  args: { items: listingItems, gridColumns: 4 },
};

export const WithHeadlineLink: Story = {
  args: {
    items: listingItems.slice(0, 3),
    gridColumns: 3,
    linkTitle: 'See all publications',
    linkHref: [{ '@id': '/publications' }],
  },
};

export const SingleItem: Story = {
  args: { items: singleItem, gridColumns: 3 },
};
