import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import { listingItems } from '../components/Blocks/Listing/fixtures';

/**
 * The carousel block, from `@kitconcept/volto-carousel-block` — a row of teaser
 * cards, as opposed to the full-bleed slider.
 *
 * Its own controls: `headline`, `items_to_show` (2 or 4), `hide_description`
 * and, where the config allows it, `loop`. Arrows and dots only appear when
 * there are more columns than `items_to_show`.
 */

const columns = listingItems.map((item, i) => ({
  '@id': `column-${i + 1}`,
  '@type': 'teaser',
  href: [item],
  title: item.title,
  head_title: item.head_title,
  description: item.description,
}));

const carousel = {
  '@type': 'carousel',
  headline: 'Latest from the council',
  items_to_show: 4,
  columns,
};

const meta = {
  title: 'Blocks/Carousel',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: carousel },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourItems: Story = {};

export const TwoItems: Story = {
  args: { data: { ...carousel, items_to_show: 2 } },
};

export const HiddenDescription: Story = {
  args: { data: { ...carousel, hide_description: true } },
};

/** Fewer columns than `items_to_show`: no arrows, no dots. */
export const FitsWithoutScrolling: Story = {
  args: { data: { ...carousel, columns: columns.slice(0, 3) } },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
export const BackgroundLayers: Story = matrixStory('layer');
