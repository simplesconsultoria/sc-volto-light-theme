import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import View from './View';

const withWrapper: Decorator = (Story, context) => {
  return (
    <Wrapper anonymous>
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    </Wrapper>
  );
};

const meta = {
  title: 'Public/Blocks/HeroBlock',
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

const sampleData = {
  '@type': 'heroBlock',
  overwrite: true,
  title: 'Isso é um Título de Destaque',
  description:
    'Uma breve descrição sobre o assunto principal para engajar o leitor.',
  headerText: 'Notícia',
  footerText: 'Fonte oficial',
  button: true,
  buttonText: 'Saiba mais',
  url: 'https://picsum.photos/seed/hero/800/600',
  date: '2026-06-17T16:33:00-03:00',
  showDate: true,
  tags: ['Brasil', 'Projeto'],
  fileType: 'Artigo',
};

export const FlexLeft: Story = {
  args: {
    data: {
      ...sampleData,
      variation: 'flex',
      textSide: 'left',
      imageSize: '50%',
      imageFit: 'cover',
    },
  },
};

export const FlexRightFull: Story = {
  args: {
    data: {
      ...sampleData,
      variation: 'flex',
      textSide: 'right',
      fullWidth: true,
      url: null, // Sem imagem para testar o fullWidth
    },
  },
};

export const CardLeft: Story = {
  args: {
    data: {
      ...sampleData,
      variation: 'card',
      textSide: 'left',
      imageSize: '40%',
      imageFit: 'contain',
    },
  },
};

export const CardRight: Story = {
  args: {
    data: {
      ...sampleData,
      variation: 'card',
      textSide: 'right',
      imageSize: '60%',
      imageFit: 'cover',
    },
  },
};
