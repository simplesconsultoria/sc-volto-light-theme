import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';

import { imageGrid, galleryContent } from './galleryFixtures';

/**
 * `gridBlock` at each supported width.
 *
 * The add-on extends the core grid: it assigns its own block themes to both
 * `gridBlock.themes` and `gridBlock.blocksConfig.themes`, and appends eight ids
 * to `allowedBlocks` (`documentByline`, `__button`, `listing`, `slider`,
 * `carousel`, `mainImageBlock`, `heroBlock`, `quoteBlock`). Core caps the grid at
 * `maxLength: 4`, so four columns is the widest an editor can build.
 *
 * Each cell here is an `image` block with a title and description, which is the
 * arrangement that shows the column rhythm and the caption treatment together.
 */

function Grid({ columns = 3 }: { columns?: number }) {
  const content = {
    ...galleryContent,
    blocks: { 'grid-1': { '@type': 'gridBlock', ...imageGrid(columns) } },
    blocks_layout: { items: ['grid-1'] },
  };
  return <RenderBlocks content={content} location={{ pathname: '/gallery' }} />;
}

const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous location="/gallery">
    <div style={{ padding: '2rem' }}>
      <Story />
    </div>
  </Wrapper>
);

const meta = {
  title: 'Public/Blocks/Grid',
  component: Grid,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    columns: { control: { type: 'inline-radio' }, options: [1, 2, 3, 4] },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneColumn: Story = { args: { columns: 1 } };
export const TwoColumns: Story = { args: { columns: 2 } };
export const ThreeColumns: Story = { args: { columns: 3 } };

/** Four is the maximum core allows — `gridBlock.maxLength` is 4. */
export const FourColumns: Story = { args: { columns: 4 } };
