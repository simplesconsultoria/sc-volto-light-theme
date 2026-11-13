import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';

/**
 * The event calendar block, from `@kitconcept/volto-light-theme`
 * (`SearchBlockViewEvent`).
 *
 * It is a search block underneath: it dispatches a thunk on mount, so it needs
 * the real store, and with no backend behind the fetch it settles into its
 * empty state. What these stories show is the frame — the filters, the theme
 * ground, the width and the border — not a populated calendar.
 */

const eventCalendar = {
  '@type': 'eventCalendar',
  headline: 'Upcoming events',
  query: {
    query: [
      {
        i: 'portal_type',
        o: 'plone.app.querystring.operation.selection.any',
        v: ['Event'],
      },
    ],
    sort_on: 'start',
    sort_order: 'ascending',
  },
};

const meta = {
  title: 'Blocks/Event Calendar',
  component: StyledBlock,
  decorators: [withBlockStore({ real: true })],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: eventCalendar },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
