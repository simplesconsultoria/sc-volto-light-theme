import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import { sampleBlocks } from './galleryFixtures';

/**
 * The table block (`slateTable`, from `@plone/volto-slate`).
 *
 * Its own controls live on `data.table`: `hideHeaders`, `fixed`, `compact`,
 * `basic`, `celled`, `inverted` and `striped`. The first row is the header.
 */

const base = sampleBlocks.slateTable;
const table = (options: Record<string, boolean> = {}) => ({
  '@type': 'slateTable',
  table: { ...base.table, ...options },
});

const meta = {
  title: 'Blocks/Table',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: table() },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Striped: Story = { args: { data: table({ striped: true }) } };

export const CompactBasic: Story = {
  args: { data: table({ compact: true, basic: true, celled: false }) },
};

export const Inverted: Story = { args: { data: table({ inverted: true }) } };

export const HiddenHeaders: Story = {
  args: { data: table({ hideHeaders: true }) },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
