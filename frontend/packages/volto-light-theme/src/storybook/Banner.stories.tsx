import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import pageHero from './images/page-hero.jpg';

/**
 * The banner block, from `@kitconcept/volto-banner-block`.
 *
 * The view builds its image as `${url}/@@images/image`, which assumes a Plone
 * object. The trailing `?` below turns that suffix into a query string, so the
 * bundled photograph is served as-is.
 *
 * `config/blocks.ts` adds a `size:noprefix` height control (`s` / `m` / `l`) on
 * top of the shared theme, width and border controls.
 */

const banner = {
  '@type': 'banner',
  url: `${pageHero}?`,
  alt: 'Placeholder photograph',
  text: 'Annual review 2026',
  additionalText: 'What the year looked like, service by service.',
  styles: { 'size:noprefix': 'm' },
};

const meta = {
  title: 'Blocks/Banner',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: banner },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeSmall: Story = {
  args: { data: { ...banner, styles: { 'size:noprefix': 's' } } },
};

export const SizeLarge: Story = {
  args: { data: { ...banner, styles: { 'size:noprefix': 'l' } } },
};

/** Text lines are optional; the image alone is a valid banner. */
export const ImageOnly: Story = {
  args: { data: { ...banner, text: '', additionalText: '' } },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
export const BackgroundLayers: Story = matrixStory('layer');
