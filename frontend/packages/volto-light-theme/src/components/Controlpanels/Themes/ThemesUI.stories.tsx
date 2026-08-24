import type { Meta, StoryObj } from '@storybook/react';

import ThemesUI from './ThemesUI';
import { corporateTheme, defaultTheme, schema, themes } from './fixtures';
import { withMockStore } from './storyMocks';

const data = { '@id': '/@controlpanels/themes', schema, items: themes };

const meta: Meta<typeof ThemesUI> = {
  title: 'Controlpanels/Themes/ThemesUI',
  component: ThemesUI,
  parameters: {
    docs: {
      description: {
        component:
          'The whole panel, with every decision arriving as a prop. Which of ' +
          'the four states it shows is decided by `adding`, `editing` and ' +
          '`cloneOf` alone. The toolbar is portalled into Volto’s `#toolbar`, ' +
          'which does not exist here — these stories set `isClient: false` ' +
          'and the buttons have their own story under ThemesToolbarActions.',
      },
    },
  },
  args: {
    data,
    pathname: '/controlpanel/themes',
    editing: null,
    adding: false,
    cloneOf: null,
    isClient: false,
    onEdit: () => {},
    onDuplicate: () => {},
    onDelete: () => {},
    onAdd: () => {},
    onSave: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  },
  decorators: [
    withMockStore,
    (Story) => (
      <div style={{ padding: '2rem', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ThemesUI>;

/** The landing state: every theme listed. */
export const Listing: Story = {};

/** Edit opened on a theme — the schema as served, seeded with its values. */
export const Editing: Story = { args: { editing: corporateTheme.id } };

/** Add opened from the toolbar: an empty form with the extra `id` field. */
export const Adding: Story = { args: { adding: true } };

/** Add opened from Duplicate: the same form, seeded from another theme. */
export const Duplicating: Story = {
  args: { adding: true, cloneOf: corporateTheme.id },
};

/** A fresh site, before anyone has added a theme of their own. */
export const OnlyTheDefaultTheme: Story = {
  args: { data: { ...data, items: [defaultTheme] } },
};
