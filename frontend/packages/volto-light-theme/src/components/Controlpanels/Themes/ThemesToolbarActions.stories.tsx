import type { Meta, StoryObj } from '@storybook/react';

import ThemesToolbarActions from './ThemesToolbarActions';

const meta: Meta<typeof ThemesToolbarActions> = {
  title: 'Controlpanels/Themes/ThemesToolbarActions',
  component: ThemesToolbarActions,
  parameters: {
    docs: {
      description: {
        component:
          'The buttons the panel portals into Volto’s toolbar. The pair ' +
          'shown depends on whether a form is open, which is the whole of the ' +
          'panel’s toolbar logic.',
      },
    },
  },
  args: {
    onSave: () => {},
    onCancel: () => {},
    onAdd: () => {},
  },
  decorators: [
    (Story) => (
      <div
        id="toolbar"
        style={{
          background: '#2e3f4b',
          padding: '1rem',
          width: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ThemesToolbarActions>;

/** Listing open: add a theme, or go back to the control panel index. */
export const Listing: Story = { args: { isForm: false } };

/** A form is open: save it, or discard and return to the listing. */
export const EditingAForm: Story = { args: { isForm: true } };
