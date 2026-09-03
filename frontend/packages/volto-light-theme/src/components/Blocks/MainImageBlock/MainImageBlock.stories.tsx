import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import Layout from './Layout';
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
  title: 'Public/Blocks/MainImageBlock',
  component: Layout,
  decorators: [withWrapper],
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
  args: {
    align: 'center',
    size: 'm',
    title: '',
    description: '',
    image: sampleImage,
  },
};

export const FullWithCaption: Story = {
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
  args: {
    align: 'left',
    size: 's',
    title: 'Featured story',
    description: 'A short summary shown beside the image.',
    image: sampleImage,
  },
};

export const RightMedium: Story = {
  args: {
    align: 'right',
    size: 'm',
    title: '',
    description: '',
    image: sampleImage,
  },
};

export const CenterWithOverlay: Story = {
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
