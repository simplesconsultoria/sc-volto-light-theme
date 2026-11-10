import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';

/**
 * The table of contents block (`toc`, Volto core).
 *
 * It lists the headings of the *other* blocks on the page, so each story passes
 * a few Slate headings as `extraBlocks`. Its own controls: the `default` (list)
 * and `horizontalMenu` variations, `levels` and `ordered`.
 */

const heading = (type: string, text: string) => ({
  '@type': 'slate',
  value: [{ type, children: [{ text }] }],
  plaintext: text,
});

const headings = [
  heading('h2', 'What we set out to do'),
  heading('h3', 'Housing'),
  heading('h3', 'Transport'),
  heading('h2', 'What changed'),
  heading('h2', 'What comes next'),
];

const toc = {
  '@type': 'toc',
  title: 'On this page',
  variation: 'default',
  levels: ['h2', 'h3'],
};

const meta = {
  title: 'Blocks/Table of Contents',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: toc, extraBlocks: headings },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};

export const Ordered: Story = { args: { data: { ...toc, ordered: true } } };

export const HorizontalMenu: Story = {
  args: { data: { ...toc, variation: 'horizontalMenu' } },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
