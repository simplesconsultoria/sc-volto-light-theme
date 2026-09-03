import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import TeaserTemplate from './TeaserTemplate';
import { listingItems, singleItem } from './fixtures';

/**
 * `_listing.scss` is scoped to `body .block.listing`, and the variation rules to
 * `&.teaser`, so the template has to sit inside the same wrapper the listing
 * block renders on a page — otherwise none of its styling applies, including the
 * focus outlines on cards.
 */
const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous>
    <div style={{ padding: '2rem' }}>
      <div className="block listing teaser">
        <Story />
      </div>
    </div>
  </Wrapper>
);

const meta = {
  title: 'Public/Blocks/Listing/Highlight',
  component: TeaserTemplate,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: { type: 'inline-radio' },
      options: ['left', 'center', 'right'],
    },
  },
} satisfies Meta<typeof TeaserTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AlignLeft: Story = {
  args: { items: listingItems.slice(0, 3), align: 'left' },
};

export const AlignRight: Story = {
  args: { items: listingItems.slice(0, 3), align: 'right' },
};

export const AlignCenter: Story = {
  args: { items: listingItems.slice(0, 3), align: 'center' },
};

export const SingleItem: Story = {
  args: { items: singleItem, align: 'left' },
};
