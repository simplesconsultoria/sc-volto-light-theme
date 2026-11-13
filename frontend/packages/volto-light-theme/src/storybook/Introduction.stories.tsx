import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';

/**
 * The introduction block, from `@kitconcept/volto-introduction-block` — a lead
 * paragraph in a larger type. It has no controls of its own, so the shared
 * theme, width and border controls are all there is to show.
 */

const slate = (text: string) => [{ type: 'p', children: [{ text }] }];

const introduction = {
  '@type': 'introduction',
  value: slate(
    'This review sets out what each service delivered this year, where it fell short, and what changes next. It is written for residents first.',
  ),
};

const meta = {
  title: 'Blocks/Introduction',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: introduction },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
