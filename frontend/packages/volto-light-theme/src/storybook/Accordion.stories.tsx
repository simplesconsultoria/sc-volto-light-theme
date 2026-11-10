import type { Meta, StoryObj } from '@storybook/react';

import {
  StyledBlock,
  matrixStory,
  stylingArgTypes,
  withBlockStore,
} from './blockStyling';
import { sampleBlocks } from './galleryFixtures';

/**
 * The accordion block, from `@eeacms/volto-accordion-block`.
 *
 * Its own controls: `right_arrows`, `collapsed` (every panel closed on load —
 * otherwise the first is open), `non_exclusive` and `filtering`. Blocks inside a
 * panel have their theme field removed (`disableThemeSchema`), so only the
 * accordion itself carries one.
 */

const accordion = { '@type': 'accordion', ...sampleBlocks.accordion };

const meta = {
  title: 'Blocks/Accordion',
  component: StyledBlock,
  decorators: [withBlockStore()],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: stylingArgTypes,
  args: { data: accordion },
} satisfies Meta<typeof StyledBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPanelOpen: Story = {};

export const Collapsed: Story = {
  args: { data: { ...accordion, collapsed: true } },
};

export const RightArrows: Story = {
  args: { data: { ...accordion, right_arrows: true } },
};

export const WithFilter: Story = {
  args: { data: { ...accordion, filtering: true, non_exclusive: true } },
};

export const Themes: Story = matrixStory('theme');
export const Widths: Story = matrixStory('width');
export const Borders: Story = matrixStory('border');
