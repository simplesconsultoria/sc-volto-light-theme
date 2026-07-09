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
        text: 'A comunicação é um direito humano fundamental. Sem ela, não há democracia plena nem exercício real da cidadania. Esta citação demonstra como o texto se comporta dentro do bloco, aplicando a fonte correta do Volto.',
      },
    ],
  },
];

export const DefaultTransparent: Story = {
  args: {
    data: {
      '@type': 'quoteBlock',
      value: sampleSlateData,
      author: 'Especialista em Comunicação',
      backgroundStyle: 'transparent',
    },
  },
};

export const FilledBackground: Story = {
  args: {
    data: {
      '@type': 'quoteBlock',
      value: sampleSlateData,
      author: 'Coletivo',
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
