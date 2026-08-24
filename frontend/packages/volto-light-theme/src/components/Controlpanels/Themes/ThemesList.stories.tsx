import type { Meta, StoryObj } from '@storybook/react';

import ThemesList from './ThemesList';
import { defaultTheme, themes } from './fixtures';

const meta: Meta<typeof ThemesList> = {
  title: 'Controlpanels/Themes/ThemesList',
  component: ThemesList,
  parameters: {
    docs: {
      description: {
        component:
          'The themes listing. Edit and Duplicate are offered for every ' +
          'theme; Delete is hidden for `default`, which the backend refuses ' +
          'to remove.',
      },
    },
  },
  // Plain no-ops: this package does not depend on `@storybook/test`, and the
  // existing stories here keep their handlers inert too.
  args: {
    onEdit: () => {},
    onDuplicate: () => {},
    onDelete: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ThemesList>;

export const Default: Story = { args: { themes } };

/** A fresh site: only the shipped theme, so no row offers Delete. */
export const OnlyTheDefaultTheme: Story = { args: { themes: [defaultTheme] } };

/** Nothing to show. The table keeps its header so the panel stays legible. */
export const Empty: Story = { args: { themes: [] } };
