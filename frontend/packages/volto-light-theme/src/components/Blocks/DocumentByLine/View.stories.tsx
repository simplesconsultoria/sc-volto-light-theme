import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import View from './View';
import { matrixStory } from '../../../storybook/blockStyling';

const withWrapper: Decorator = (Story, context) => {
  return (
    <Wrapper anonymous>
      <Story />
    </Wrapper>
  );
};

/** The measure the view-only stories are shown at. */
const contained: Decorator = (Story) => (
  <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Blocks/DocumentByLineBlock',
  component: View,
  decorators: [withWrapper],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object' },
  },
} satisfies Meta<typeof View>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleProperties = {
  created: '2026-09-29T10:00:00+00:00',
  modified: '2026-09-29T12:00:00+00:00',
  effective: '2026-09-29T10:00:00+00:00',
  creators: ['John Doe'],
};

export const Default: Story = {
  decorators: [contained],
  args: {
    data: {
      '@type': 'documentByline',
      showModified: true,
      showPublished: true,
      showAuthor: true,
    },
    properties: sampleProperties,
  },
};

export const OnlyAuthor: Story = {
  decorators: [contained],
  args: {
    data: {
      '@type': 'documentByline',
      showModified: false,
      showPublished: false,
      showAuthor: true,
    },
    properties: sampleProperties,
  },
};

export const NoAuthor: Story = {
  decorators: [contained],
  args: {
    data: {
      '@type': 'documentByline',
      showModified: true,
      showPublished: true,
      showAuthor: false,
    },
    properties: sampleProperties,
  },
};

/*
 * Theme, width and border reach the block through `RenderBlocks`, not through
 * `View`'s props, so these render through it against the gallery content item,
 * which carries the dates and creators the byline reads.
 */
const styled = {
  '@type': 'documentByline',
  showModified: true,
  showPublished: true,
  showAuthor: true,
};

export const Themes: Story = {
  ...matrixStory('theme'),
  args: { data: styled },
};

export const Widths: Story = {
  ...matrixStory('width'),
  args: { data: styled },
};

export const Borders: Story = {
  ...matrixStory('border'),
  args: { data: styled },
};
