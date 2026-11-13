import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';

import { galleryContent } from './galleryFixtures';

/**
 * The separator block as it renders in a page, through `RenderBlocks`.
 *
 * This package replaces the view of `@kitconcept/volto-separator-block` with
 * `components/Blocks/Separator/View.tsx`, which reads `width`, `alignment`,
 * `thickness` and `color` from the block data. The view itself, rendered in
 * isolation, is documented in `Blocks/Separator/View`.
 *
 * Blocks saved by the upstream separator keep rendering: its
 * `styles.shortLine` becomes a 165px line and `styles['align:noprefix']`
 * aligns it (see the "Upstream data" stories).
 */

function Separator(data: Record<string, any>) {
  const content = {
    ...galleryContent,
    blocks: { 'sep-1': { '@type': 'separator', ...data } },
    blocks_layout: { items: ['sep-1'] },
  };
  return <RenderBlocks content={content} location={{ pathname: '/gallery' }} />;
}

const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous location="/gallery">
    <div style={{ padding: '3rem 2rem' }}>
      <Story />
    </div>
  </Wrapper>
);

const meta = {
  title: 'Blocks/Separator/In page',
  component: Separator,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'text', description: 'CSS width of the line' },
    alignment: {
      control: 'inline-radio',
      options: ['left', 'center', 'right'],
    },
    thickness: { control: { type: 'number', min: 1, max: 24 } },
    color: { control: 'color' },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full-width 1px rule in the theme's border colour. */
export const FullWidth: Story = {
  args: { styles: { 'blockWidth:noprefix': 'default' } },
};

export const HalfWidthCentred: Story = {
  args: {
    width: '50%',
    alignment: 'center',
    thickness: 2,
    styles: { 'blockWidth:noprefix': 'default' },
  },
};

export const ShortLineLeft: Story = {
  args: {
    width: '25%',
    alignment: 'left',
    thickness: 3,
    styles: { 'blockWidth:noprefix': 'default' },
  },
};

export const ShortLineRight: Story = {
  args: {
    width: '25%',
    alignment: 'right',
    thickness: 3,
    color: '#c92a2a',
    styles: { 'blockWidth:noprefix': 'default' },
  },
};

/** The narrow container width, to show the rule tracking the block width. */
export const NarrowWidth: Story = {
  args: { styles: { 'blockWidth:noprefix': 'narrow' } },
};

/** Saved by `@kitconcept/volto-separator-block`: full-width rule. */
export const UpstreamDataFullWidth: Story = {
  name: 'Upstream data: full width',
  args: { styles: { 'blockWidth:noprefix': 'default', shortLine: false } },
};

/** Saved by `@kitconcept/volto-separator-block`: 165px line, aligned left. */
export const UpstreamDataShortLineLeft: Story = {
  name: 'Upstream data: short line, left',
  args: {
    styles: {
      'blockWidth:noprefix': 'default',
      shortLine: true,
      'align:noprefix': 'left',
    },
  },
};

/** Saved by `@kitconcept/volto-separator-block`: 165px line, aligned right. */
export const UpstreamDataShortLineRight: Story = {
  name: 'Upstream data: short line, right',
  args: {
    styles: {
      'blockWidth:noprefix': 'default',
      shortLine: true,
      'align:noprefix': 'right',
    },
  },
};
