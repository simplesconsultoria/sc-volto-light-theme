import type { Meta, StoryObj } from '@storybook/react';

import ThemeForm from './ThemeForm';
import { corporateTheme, schema } from './fixtures';
import { withMockStore } from './storyMocks';

const meta: Meta<typeof ThemeForm> = {
  title: 'Controlpanels/Themes/ThemeForm',
  component: ThemeForm,
  parameters: {
    docs: {
      description: {
        component:
          'The add and edit form. Both come from the served schema; the add ' +
          'form differs only in the `id` field `addSchema` prepends, which ' +
          'the backend does not serve because the id lives in the registry ' +
          'record prefix. This is Volto’s real `Form`, so the widgets and ' +
          'the validation are the ones the panel actually uses — the ' +
          'inputs work.',
      },
    },
  },
  args: {
    schema,
    onSubmit: () => {},
    onCancel: () => {},
  },
  decorators: [
    withMockStore,
    (Story) => (
      <div
        style={{ padding: '2rem', background: '#f5f5f5', maxWidth: '40rem' }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ThemeForm>;

/** Editing an existing theme: the schema as served, seeded with its values. */
export const Editing: Story = {
  args: { adding: false, theme: corporateTheme },
};

/** Adding one: note the required `id`, and that nothing is filled in. */
export const Adding: Story = { args: { adding: true } };

/**
 * Adding from Duplicate: settings and description carry over, the id does not,
 * and the name is suffixed so the copy is recognisable in the listing.
 */
export const DuplicatingATheme: Story = {
  args: { adding: true, cloneOf: corporateTheme },
};
