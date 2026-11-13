import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import { listingItems } from '../components/Blocks/Listing/fixtures';

/**
 * The slider block, from `@kitconcept/volto-slider-block`, through this
 * package's `View` and `DefaultBody` customizations — the `View` override is
 * what forwards the theme and border `style` to the slider root.
 *
 * Its own controls: the `default` and `simple` variations, and per slide
 * `flagAlign` (`left` / `right`), `hideButton` and `buttonText`.
 */

const slides = listingItems.slice(0, 3).map((item, i) => ({
  '@id': `slide-${i + 1}`,
  href: [item],
  title: item.title,
  description: item.description,
  head_title: 'Kicker',
  buttonText: 'Continue reading',
}));

const slider = { '@type': 'slider', variation: 'default', slides };

const meta = {
  title: 'Blocks/Slider',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: slider },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Simple: Story = {
  args: { data: { ...slider, variation: 'simple' } },
};

export const FlagRight: Story = {
  args: {
    data: {
      ...slider,
      slides: slides.map((s) => ({ ...s, flagAlign: 'right' })),
    },
  },
};

export const HiddenButton: Story = {
  args: {
    data: {
      ...slider,
      slides: slides.map((s) => ({ ...s, hideButton: true })),
    },
  },
};

/** A single slide hides the arrows and the dots. */
export const SingleSlide: Story = {
  args: { data: { ...slider, slides: slides.slice(0, 1) } },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
export const BackgroundLayers: Story = matrixStory('layer');
