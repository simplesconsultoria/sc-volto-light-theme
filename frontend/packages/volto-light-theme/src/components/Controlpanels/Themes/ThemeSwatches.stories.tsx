import type { Meta, StoryObj } from '@storybook/react';

import ThemeSwatches from './ThemeSwatches';
import { corporateTheme, defaultTheme, natalTheme } from './fixtures';

const meta: Meta<typeof ThemeSwatches> = {
  title: 'Controlpanels/Themes/ThemeSwatches',
  component: ThemeSwatches,
  parameters: {
    docs: {
      description: {
        component:
          'The colour chips shown in the themes listing. One chip per custom ' +
          'property the theme actually contributes, hovering shows the ' +
          'variable and its value.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ThemeSwatches>;

export const Default: Story = { args: { theme: defaultTheme } };

export const Corporate: Story = { args: { theme: corporateTheme } };

export const Natal: Story = { args: { theme: natalTheme } };

/** A theme with no settings contributes no chips — the row stays empty. */
export const NoSettings: Story = {
  args: {
    theme: { '@id': '/@controlpanels/themes/bare', id: 'bare', name: 'Bare' },
  },
};
