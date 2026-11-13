import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { StyledBlock, stylingArgTypes, withBlockStore } from './blockStyling';
import { DEFAULT_COLOR_GROUPS } from '../config/blockThemes';
import { colorGroupCustomProperties } from '../helpers/themeStyles';
import pageHero from './images/page-hero.jpg';

/**
 * Colour Group background layers that carry an image.
 *
 * `StylingMatrix` covers the pattern presets; this story covers the other kind
 * of layer a Color Group can hold, a photograph. The layer is written as the
 * custom properties the Themes control panel stores, so the block theme
 * `custom-accent-neutral` paints it on its back ground.
 */

const quote = {
  '@type': 'quoteBlock',
  value: [
    {
      type: 'p',
      children: [
        {
          text: 'A photograph behind the block is the back layer of its Color Group, not a picture inside it.',
        },
      ],
    },
  ],
  author: 'Collective',
  backgroundStyle: 'transparent',
};

const imageLayer = colorGroupCustomProperties({
  ...DEFAULT_COLOR_GROUPS.accent,
  bg_image_light_desktop: `url(${pageHero})`,
  bg_size: 'cover',
  bg_position: 'center',
}) as React.CSSProperties;

const meta = {
  title: 'Blocks/ColorGroupLayers',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: quote, theme: 'custom-accent-neutral' },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The accent Color Group's background layer is a photograph, cropped to cover. */
export const Image: Story = {
  render: (args) => (
    <div style={imageLayer}>
      <StyledBlock {...args} />
    </div>
  ),
};
