import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import View from './View';

export default {
  title: 'Blocks/Separator/View',
  component: View,
} as Meta;

const Template: StoryFn = (args) => <View data={args.data} />;

export const Default = Template.bind({});
Default.args = {
  data: {},
};
