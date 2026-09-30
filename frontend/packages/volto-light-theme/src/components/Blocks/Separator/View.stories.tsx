import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import View from './View';

/**
 * Separator Block — divisor horizontal configuravel.
 * Suporta espessura, cor, largura e alinhamento.
 */
export default {
  title: 'Blocks/Separator/View',
  component: View,
  argTypes: {
    'data.width': {
      control: 'select',
      options: ['100%', '75%', '50%', '25%'],
    },
    'data.alignment': {
      control: 'select',
      options: ['left', 'center', 'right'],
    },
  },
} as Meta;

const Template: StoryFn = (args) => <View data={args.data} />;

// Separator padrao: largura total, espessura 1px
export const Default = Template.bind({});
Default.args = {
  data: {},
};

// Separator com metade da largura, centralizado
export const HalfWidthCenter = Template.bind({});
HalfWidthCenter.args = {
  data: { width: '50%', alignment: 'center', thickness: 2 },
};

// Separator curto alinhado a esquerda (short line)
export const ShortLineLeft = Template.bind({});
ShortLineLeft.args = {
  data: { width: '25%', alignment: 'left', thickness: 3, color: '#003a7a' },
};

// Separator curto alinhado a direita
export const ShortLineRight = Template.bind({});
ShortLineRight.args = {
  data: { width: '25%', alignment: 'right', thickness: 2, color: '#e74c3c' },
};

// Separator espesso, 75% de largura
export const ThickWide = Template.bind({});
ThickWide.args = {
  data: { width: '75%', alignment: 'center', thickness: 5 },
};
