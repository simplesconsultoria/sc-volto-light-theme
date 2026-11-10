import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';
import CustomGridView from './View';
import { matrixStory } from '../../../storybook/blockStyling';

/** Utility to build a Slate text value for demo content */
const slate = (text: string) => [{ type: 'p', children: [{ text }] }];

/**
 * CustomGridView - Public-facing grid block.
 *
 * Stories below demonstrate several layout presets with themed columns
 * containing slate text blocks, matching the approach used in VLT storybook.
 */

const withWrapper = (Story: any) => (
  <Wrapper anonymous location="/custom-grid-story">
    <Story />
  </Wrapper>
);

/** The measure the view-only stories are shown at. */
const contained = (Story: any) => (
  <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
    <Story />
  </div>
);

const meta: Meta<typeof CustomGridView> = {
  title: 'Blocks/CustomGrid',
  component: CustomGridView,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof CustomGridView>;

// Builds a column fixture with a slate block inside
const fakeColumn = (theme: string, text: string) => ({
  '@type': 'customGridColumn',
  settings: { theme },
  blocks_layout: { items: ['text1'] },
  blocks: {
    text1: { '@type': 'slate', value: slate(text) },
  },
});

export const FullWidth: Story = {
  decorators: [contained],
  name: '100%',
  args: {
    data: {
      layout: '1',
      data: {
        blocks_layout: { items: ['col1'] },
        blocks: {
          col1: fakeColumn('', 'Full-width single column content.'),
        },
      },
    },
  },
};

export const TwoColumns5050: Story = {
  decorators: [contained],
  name: '50 / 50',
  args: {
    data: {
      layout: '1-1',
      data: {
        blocks_layout: { items: ['col1', 'col2'] },
        blocks: {
          col1: fakeColumn('primary', 'Left column with primary theme (50%).'),
          col2: fakeColumn(
            'secondary',
            'Right column with secondary theme (50%).',
          ),
        },
      },
    },
  },
};

export const TwoColumns3366: Story = {
  decorators: [contained],
  name: '33 / 66',
  args: {
    data: {
      layout: '1-2',
      data: {
        blocks_layout: { items: ['col1', 'col2'] },
        blocks: {
          col1: fakeColumn('tertiary', 'Narrow sidebar (33%)'),
          col2: fakeColumn(
            '',
            'Wide main content area (66%). Stacks on mobile.',
          ),
        },
      },
    },
  },
};

export const TwoColumns6040: Story = {
  decorators: [contained],
  name: '60 / 40',
  args: {
    data: {
      layout: '3-2',
      data: {
        blocks_layout: { items: ['col1', 'col2'] },
        blocks: {
          col1: fakeColumn('', 'Content area at 60%.'),
          col2: fakeColumn('grey', 'Sidebar at 40% with grey theme.'),
        },
      },
    },
  },
};

export const ThreeColumns: Story = {
  decorators: [contained],
  name: '33 / 33 / 33',
  args: {
    data: {
      layout: '1-1-1',
      data: {
        blocks_layout: { items: ['col1', 'col2', 'col3'] },
        blocks: {
          col1: fakeColumn('', 'First column (33%)'),
          col2: fakeColumn('grey', 'Second column with grey theme (33%)'),
          col3: fakeColumn(
            'tertiary',
            'Third column with tertiary theme (33%)',
          ),
        },
      },
    },
  },
};

export const ThreeColumnsAsym: Story = {
  decorators: [contained],
  name: '50 / 25 / 25',
  args: {
    data: {
      layout: '2-1-1',
      data: {
        blocks_layout: { items: ['col1', 'col2', 'col3'] },
        blocks: {
          col1: fakeColumn('primary', 'Main area at 50%.'),
          col2: fakeColumn('', 'Side column 25%.'),
          col3: fakeColumn('grey', 'Side column 25%.'),
        },
      },
    },
  },
};

export const FourColumns: Story = {
  decorators: [contained],
  name: '25 / 25 / 25 / 25',
  args: {
    data: {
      layout: '1-1-1-1',
      data: {
        blocks_layout: { items: ['col1', 'col2', 'col3', 'col4'] },
        blocks: {
          col1: fakeColumn('primary', 'Col 1'),
          col2: fakeColumn('secondary', 'Col 2'),
          col3: fakeColumn('tertiary', 'Col 3'),
          col4: fakeColumn('grey', 'Col 4'),
        },
      },
    },
  },
};

/*
 * Theme, width and border reach the block through `RenderBlocks`, not through
 * the view's props — these render through it, once per value. The columns keep
 * no theme of their own, so the block's theme is what shows.
 */
const styled = {
  '@type': 'customGrid',
  layout: '1-1-1',
  data: {
    blocks_layout: { items: ['col1', 'col2', 'col3'] },
    blocks: {
      col1: fakeColumn('', 'First column (33%).'),
      col2: fakeColumn('', 'Second column (33%).'),
      col3: fakeColumn('', 'Third column (33%).'),
    },
  },
};

export const Themes: Story = {
  ...matrixStory('theme'),
  args: { data: styled },
};

export const Widths: Story = {
  ...matrixStory('width'),
  args: { data: styled },
};

export const Borders: Story = {
  ...matrixStory('border'),
  args: { data: styled },
};

export const BackgroundLayers: Story = {
  ...matrixStory('layer'),
  args: { data: styled },
};
