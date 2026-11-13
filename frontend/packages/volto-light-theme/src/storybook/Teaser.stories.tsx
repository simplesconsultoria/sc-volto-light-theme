import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import { sampleBlocks } from './galleryFixtures';

/**
 * The teaser block, through this package's `DefaultBody` customization of
 * `@kitconcept/volto-light-theme`.
 *
 * Its own control is the image alignment, `styles.align` (`left` / `center` /
 * `right`), plus `overwrite` for replacing the target's title and description.
 * The card is the block's "high ground", so it takes the *front* Color Group of
 * the theme — which the custom theme and the front-layer sample make visible.
 */

const teaser = { '@type': 'teaser', ...sampleBlocks.teaser };

const meta = {
  title: 'Blocks/Teaser',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: teaser },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AlignLeft: Story = {
  args: { data: { ...teaser, styles: { align: 'left' } } },
};

export const AlignRight: Story = {
  args: { data: { ...teaser, styles: { align: 'right' } } },
};

export const Overwritten: Story = {
  args: {
    data: {
      ...teaser,
      overwrite: true,
      head_title: 'Edited kicker',
      title: 'A title written for this page',
      description: 'The target keeps its own; this teaser shows this one.',
    },
  },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
export const BackgroundLayers: Story = matrixStory('layer');
