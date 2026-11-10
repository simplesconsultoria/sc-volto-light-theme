import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';

/**
 * The video block (Volto core). It embeds a third-party player, so what shows
 * inside the frame depends on network access; the frame, alignment, theme,
 * width and border are this theme's.
 *
 * Its own control is `align` (`left` / `center` / `right` / `full`).
 */

const video = {
  '@type': 'video',
  url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
};

const meta = {
  title: 'Blocks/Video',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: video },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AlignLeft: Story = {
  args: { data: { ...video, align: 'left' } },
};

export const AlignRight: Story = {
  args: { data: { ...video, align: 'right' } },
};

export const AlignFull: Story = {
  args: { data: { ...video, align: 'full' } },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
