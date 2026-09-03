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
    <div style={{ background: 'var(--primary-color)', padding: '2rem' }}>
      {/*
        The controls are styled for the dark header bar — `_accessibilityControls.scss`
        gives the buttons a light ground and expects `--secondary-color` behind
        them. Rendered on a pale page they read as unstyled browser buttons, and
        without the bar's flex row they wrap. This is the chain `HeaderBar` builds.
      */}
      <header className="header-wrapper">
        <div className="header-bar-wrapper">
          <div className="header-bar">
            <div className="header-bar__inner">
              <div className="header-bar__actions">
                <Story />
              </div>
            </div>
          </div>
        </div>
      </header>
      <p
        style={{ marginTop: '2rem', color: 'var(--primary-foreground-color)' }}
      >
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
