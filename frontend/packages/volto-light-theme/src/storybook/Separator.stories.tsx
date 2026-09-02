import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';

import { galleryContent } from './galleryFixtures';

/**
 * The separator block, from `@kitconcept/volto-separator-block`.
 *
 * Its schema has three controls, all under `styles`: `blockWidth:noprefix`,
 * a `shortLine` toggle, and `align:noprefix`. The alignment is deliberately
 * **disabled unless `shortLine` is on** (`schema.ts:83`) — a full-width rule has
 * nothing to align — which is why the stories below pair them.
 */

function Separator({ styles = {} }: { styles?: Record<string, any> }) {
  const content = {
    ...galleryContent,
    blocks: { 'sep-1': { '@type': 'separator', styles } },
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
  title: 'Public/Blocks/Separator',
  component: Separator,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full-width rule. Alignment is disabled in this state. */
export const FullWidth: Story = {
  args: { styles: { 'blockWidth:noprefix': 'default', shortLine: false } },
};

export const ShortLineLeft: Story = {
  args: {
    styles: {
      'blockWidth:noprefix': 'default',
      shortLine: true,
      'align:noprefix': 'left',
    },
  },
};

export const ShortLineCentre: Story = {
  args: {
    styles: {
      'blockWidth:noprefix': 'default',
      shortLine: true,
      'align:noprefix': 'center',
    },
  },
};

export const ShortLineRight: Story = {
  args: {
    styles: {
      'blockWidth:noprefix': 'default',
      shortLine: true,
      'align:noprefix': 'right',
    },
  },
};

/** The narrow container width, to show the rule tracking the block width. */
export const NarrowWidth: Story = {
  args: { styles: { 'blockWidth:noprefix': 'narrow', shortLine: false } },
};
