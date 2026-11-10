import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import { linkedItem } from './galleryFixtures';
import hero from './images/hero.jpg';
import { imageScales } from './images/imageScales';

/**
 * The highlight block, from `@kitconcept/volto-highlight-block`.
 *
 * The view renders nothing in view mode unless `data.url` is set, and hands the
 * configured `Image` component an item built from `url` + `image_scales` — so
 * both are needed for the image to show. The description is a Slate `value`.
 *
 * Its own style control is `descriptionColor`, one of seven
 * `highlight-custom-color-*` names from the block's config.
 */

const slate = (text: string) => [{ type: 'p', children: [{ text }] }];

const highlight = {
  '@type': 'highlight',
  url: '/gallery/hero',
  image_field: 'image',
  image_scales: { image: [imageScales(hero)] },
  headtitle: 'Featured',
  title: 'A service redesigned with its users',
  value: slate(
    'Six months of research, three prototypes and one much shorter form.',
  ),
  button: true,
  buttonText: 'Read the case study',
  buttonLink: [linkedItem],
};

const meta = {
  title: 'Blocks/Highlight',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: highlight },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutButton: Story = {
  args: { data: { ...highlight, button: false } },
};

export const DescriptionColor: Story = {
  args: {
    data: {
      ...highlight,
      styles: { descriptionColor: 'highlight-custom-color-3' },
    },
  },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
export const BackgroundLayers: Story = matrixStory('layer');
