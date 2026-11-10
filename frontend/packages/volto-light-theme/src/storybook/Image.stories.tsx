import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import gallery from './images/gallery.jpg';

/**
 * The image block (Volto core, extended by `@kitconcept/volto-light-theme`).
 *
 * Its own controls are `styles['align:noprefix']` (`left` / `center` / `right`)
 * and `styles['size:noprefix']` (`s` / `m` / `l`). A floated image (left or
 * right) has no width control of its own: `resolveBlockWidthForBlock` takes the
 * width of the block it floats beside, which is why those stories pass a
 * paragraph as `extraBlocks`. The border goes on the `<img>`, not the caption.
 */

const slate = (text: string) => [{ type: 'p', children: [{ text }] }];

const paragraph = {
  '@type': 'slate',
  value: slate(
    'Body copy that flows beside a floated image. The image takes its block width from this paragraph, so changing the paragraph’s width moves the image with it. A few more sentences make the wrap visible: the council met on Tuesday, the agenda ran long, and the minutes were published the same evening.',
  ),
};

const image = (align: string, size = 'l') => ({
  '@type': 'image',
  url: gallery,
  alt: 'Placeholder photograph',
  title: 'Caption title',
  description: 'A short caption under the image.',
  styles: { 'align:noprefix': align, 'size:noprefix': size },
});

const meta = {
  title: 'Blocks/Image',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: image('center') },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Center: Story = {};

export const CenterMedium: Story = { args: { data: image('center', 'm') } };

export const CenterSmall: Story = { args: { data: image('center', 's') } };

export const FloatLeft: Story = {
  args: { data: image('left', 'm'), extraBlocks: [paragraph] },
};

export const FloatRight: Story = {
  args: { data: image('right', 's'), extraBlocks: [paragraph] },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
