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
  title: 'Public/Blocks/QuoteBlock',
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

const sampleSlateData = [
  {
    type: 'p',
    children: [
      {
        text: 'Access to information is a fundamental right. Without it there is no full democracy and no real exercise of citizenship. This quotation shows how text behaves inside the block, with the theme typography applied.',
      },
    ],
  },
];

export const DefaultTransparent: Story = {
  args: {
    data: {
      '@type': 'quoteBlock',
      value: sampleSlateData,
      author: 'Communications Specialist',
      backgroundStyle: 'transparent',
    },
  },
};

export const FilledBackground: Story = {
  args: {
    data: {
      '@type': 'quoteBlock',
      value: sampleSlateData,
      author: 'Collective',
      backgroundStyle: 'filled',
    },
  },
};

export const NoAuthor: Story = {
  args: {
    data: {
      '@type': 'quoteBlock',
      value: sampleSlateData,
      backgroundStyle: 'transparent',
    },
  },
};
