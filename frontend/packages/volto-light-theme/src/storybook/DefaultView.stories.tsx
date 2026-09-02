import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';
import DefaultView from '@plone/volto/components/theme/View/DefaultView';

import {
  pageContent,
  newsContent,
  eventContent,
  pageStore,
} from './viewFixtures';

/**
 * Page-level composition.
 *
 * The block stories show each block in isolation; this shows them stacked the
 * way `RenderBlocks` puts them on a real page, inside the `#page-document`
 * container `DefaultView` provides. Several rules only apply there — the
 * listing variation selectors are scoped to
 * `#page-document .blocks-group-wrapper > .block.listing.carousel`, for one —
 * so spacing between blocks and container widths are only truthful here.
 *
 * `customStore` seeds the querystring results the listing block would otherwise
 * fetch; see `pageStore` in `./fixtures`.
 */
const withPage: Decorator = (Story) => (
  <Wrapper anonymous customStore={pageStore} location="/annual-review">
    <Story />
  </Wrapper>
);

const meta = {
  title: 'Public/Views/Default View',
  component: DefaultView,
  decorators: [withPage],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
} satisfies Meta<typeof DefaultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every block the add-on ships, composed on one Document. */
export const FullPage: Story = {
  args: {
    content: pageContent,
    location: { pathname: '/annual-review' },
  },
};

/** A shorter News Item: title, byline, image, text and a quote. */
export const NewsItem: Story = {
  args: {
    content: newsContent,
    location: { pathname: '/news/library-reopens-after-refurbishment' },
  },
};

/**
 * An Event, which upstream VLT gives its own initial blocks and its own view.
 *
 * The `eventMetadata` block is what makes the type look distinct — it renders
 * the schedule, location and contact details straight off the content item.
 */
export const Event: Story = {
  args: {
    content: eventContent,
    location: { pathname: '/events/accessibility-workshop' },
  },
};
