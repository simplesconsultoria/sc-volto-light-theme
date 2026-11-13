import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import { imageScales } from './images/imageScales';

/**
 * The logos block, from `@kitconcept/volto-logos-block`, rendered through this
 * package's `LogosContainer` customization.
 *
 * The container builds each `src` from the logo's `@id` and its first scale's
 * `download`, so `imageScales` on the placeholder served from `public/` gives a
 * working URL. `logos_container_width` is removed from the schema by
 * `enhanceBlockConfig` — the shared block width replaces it — so only
 * `logos_size` (`s` / `l`) is the block's own.
 */

const PLACEHOLDER = '/images/placeholder.svg';

const logo = (n: number) => {
  const scale = imageScales(PLACEHOLDER, 240, 120);
  return {
    '@id': `logo-${n}`,
    alt: `Partner ${n}`,
    logo: [
      {
        '@id': scale.base_path,
        image_field: 'image',
        image_scales: { image: [scale] },
      },
    ],
    href: [{ '@id': `/partners/partner-${n}`, title: `Partner ${n}` }],
  };
};

const logos = {
  '@type': 'logos',
  logos: [1, 2, 3, 4, 5, 6].map(logo),
  logos_size: 's',
};

const meta = {
  title: 'Blocks/Logos',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: logos },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {};

export const Large: Story = {
  args: { data: { ...logos, logos_size: 'l' } },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
