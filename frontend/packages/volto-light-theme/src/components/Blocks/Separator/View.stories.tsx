import React from 'react';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import View from './View';
import { matrixStory, withBlockStore } from '../../../storybook/blockStyling';

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

/*
 * Theme and width reach the block through `RenderBlocks`, not through `View`'s
 * props, so these render through it. There is no border matrix: `separator` is
 * in `DEFAULT_BORDER_EXCLUDED_BLOCKS`, and the view reads
 * `--cardBorderWidth` / `--cardBorderColor` as its own thickness and colour.
 */
const styled = {
  data: {
    '@type': 'separator',
    width: '50%',
    alignment: 'center',
    thickness: 3,
  },
};

export const Themes: StoryObj = {
  ...matrixStory('theme', styled),
  decorators: [withBlockStore()],
};

export const Widths: StoryObj = {
  ...matrixStory('width', styled),
  decorators: [withBlockStore()],
};
