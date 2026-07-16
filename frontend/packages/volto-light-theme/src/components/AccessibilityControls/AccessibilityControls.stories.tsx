import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';

import AccessibilityControls from './AccessibilityControls';

type StoryParams = {
  fontScale?: string;
};

const withStoredScale: Decorator = (Story, context) => {
  const { fontScale } = context.parameters as StoryParams;

  if (typeof window !== 'undefined' && fontScale) {
    window.localStorage.setItem('accessibility:font-scale', fontScale);
  }

  return (
    <div style={{ backgroundColor: '#f0f0f0', padding: '2rem' }}>
      <Story />
      <p style={{ marginTop: '2rem' }}>
        Hover over this text to test the hover reader! It will read the text out
        loud using window.speechSynthesis. You can also test the font size
        controls.
      </p>
    </div>
  );
};

const meta = {
  title: 'Public/Header/AccessibilityControls',
  component: AccessibilityControls,
  decorators: [withStoredScale],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccessibilityControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmallerScale: Story = {
  parameters: {
    fontScale: '0.8',
  },
};

export const LargerScale: Story = {
  parameters: {
    fontScale: '1.3',
  },
};
