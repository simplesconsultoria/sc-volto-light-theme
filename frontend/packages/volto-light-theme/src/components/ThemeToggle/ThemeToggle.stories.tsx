import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';

import ThemeToggle from './ThemeToggle';

type StoryParams = {
  theme?: 'light' | 'dark' | 'high-contrast';
};

const withThemePreference: Decorator = (Story, context) => {
  const { theme } = context.parameters as StoryParams;

  if (typeof window !== 'undefined' && theme) {
    window.localStorage.setItem('theme', theme);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <Story />
    </div>
  );
};

const meta = {
  title: 'Public/ThemeToggle',
  component: ThemeToggle,
  decorators: [withThemePreference],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkPreferred: Story = {
  parameters: {
    theme: 'dark',
  },
};

export const HighContrastPreferred: Story = {
  parameters: {
    theme: 'high-contrast',
  },
};
