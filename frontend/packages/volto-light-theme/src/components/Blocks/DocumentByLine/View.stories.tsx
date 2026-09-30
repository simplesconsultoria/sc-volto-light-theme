import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import View from './View';

const withWrapper: Decorator = (Story, context) => {
  return (
    <Wrapper anonymous>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    </Wrapper>
  );
};

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
