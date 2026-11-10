import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import Layout from './Layout';
import { matrixStory, withBlockStore } from '../../../storybook/blockStyling';
import mainImage from '../../../storybook/images/main-image.jpg';

type StoryParams = {
  containerWidth?: number;
};

const SAMPLE_IMAGE = mainImage;

const sampleImage = (
  <img
    src={SAMPLE_IMAGE}
    alt="Council chamber during a public session"
    className="main-image"
    width={1200}
    height={600}
    loading="eager"
  />
);

const withWrapper: Decorator = (Story, context) => {
  const params = (context?.parameters || {}) as StoryParams;
  const containerWidth = params.containerWidth ?? 960;

  // Provide CSS variables consumed by _mainImageBlock.scss so the story renders
  // without the full theme being in scope.
  const themeStyle = {
    '--narrow-container-width': `${containerWidth}px`,
    '--main-image-aspect-ratio': '2 / 1',
    '--main-image-content-spacing': '0.75rem',
    '--main-image-large-width': '100%',
    '--main-image-medium-width': '60%',
    '--main-image-small-width': '40%',
    '--main-image-overlay-padding': '1rem',
    '--main-image-max-height': '480px',
    '--overlay-gradient':
      'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
    '--text-shadow-medium': '0 1px 2px rgba(0,0,0,0.6)',
    '--text-shadow-light': '0 1px 1px rgba(0,0,0,0.4)',
    '--spacing-small': '1rem',
  } as React.CSSProperties;

  return (
    <Wrapper anonymous>
      <div style={{ width: containerWidth, padding: 24, ...themeStyle }}>
        <Story />
      </div>
    </Wrapper>
  );
};

const meta = {
  title: 'Blocks/MainImageBlock',
  component: Layout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: { type: 'inline-radio' },
      options: ['left', 'center', 'right', 'full'],
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['s', 'm', 'l'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [withWrapper],
  args: {
    align: 'center',
    size: 'm',
    title: '',
    description: '',
    image: sampleImage,
  },
};

export const FullWithCaption: Story = {
  decorators: [withWrapper],
  parameters: {
    containerWidth: 1080,
  },
  args: {
    align: 'full',
    size: 'l',
    title: 'Public session attended by dozens of citizens',
    description:
      'The council welcomed residents for the debate on the 2026 budget.',
    image: sampleImage,
  },
};

export const LeftSmall: Story = {
  decorators: [withWrapper],
  args: {
    align: 'left',
    size: 's',
    title: 'Featured story',
    description: 'A short summary shown beside the image.',
    image: sampleImage,
  },
};

export const RightMedium: Story = {
  decorators: [withWrapper],
  args: {
    align: 'right',
    size: 'm',
    title: '',
    description: '',
    image: sampleImage,
  },
};

export const CenterWithOverlay: Story = {
  decorators: [withWrapper],
  parameters: {
    containerWidth: 800,
  },
  args: {
    align: 'center',
    size: 'l',
    title: 'Centred image with an overlaid caption',
    description: 'The description sits over the lower edge of the image.',
    image: sampleImage,
  },
};

/*
 * The stories above render `Layout` with a hand-built image and stand-in CSS
 * variables. These render the registered `mainImageBlock` through
 * `RenderBlocks` against a content item with a `preview_image_link`, so the real
 * stylesheet, theme, width and border all apply. `withWrapper` is per story
 * rather than on the meta so it does not cap these at 960px.
 */
const styled = {
  '@type': 'mainImageBlock',
  align: 'center',
  size: 'l',
  title: 'Public session attended by dozens of citizens',
  description: 'The council welcomed residents for the 2026 budget debate.',
};

export const Themes: StoryObj = {
  ...matrixStory('theme', { data: styled }),
  decorators: [withBlockStore()],
};

export const Widths: StoryObj = {
  ...matrixStory('width', { data: styled }),
  decorators: [withBlockStore()],
};

/** The border goes on the `<img>`, not around the caption (`_borders.scss`). */
export const Borders: StoryObj = {
  ...matrixStory('border', { data: styled }),
  decorators: [withBlockStore()],
};
