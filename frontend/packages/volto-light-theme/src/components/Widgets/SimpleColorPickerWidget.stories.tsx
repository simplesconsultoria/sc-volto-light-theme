import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import SimpleColorPickerWidget from './SimpleColorPickerWidget';

export default {
  title: 'Widgets/SimpleColorPickerWidget',
  component: SimpleColorPickerWidget,
  argTypes: {
    onChange: { action: 'changed' },
  },
} as Meta<typeof SimpleColorPickerWidget>;

const Template: StoryFn<typeof SimpleColorPickerWidget> = (args) => (
  <SimpleColorPickerWidget {...args} />
);

export const Default = Template.bind({});
Default.args = {
  id: 'color-picker-default',
  title: 'Default Color Picker',
  value: '#ff0000',
  description: 'Pick a color for the border',
};

export const WithoutValue = Template.bind({});
WithoutValue.args = {
  id: 'color-picker-empty',
  title: 'Empty Color Picker',
  value: undefined,
};
