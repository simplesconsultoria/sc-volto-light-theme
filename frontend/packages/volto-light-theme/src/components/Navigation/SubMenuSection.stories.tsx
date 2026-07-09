import type { Meta, StoryObj } from '@storybook/react';

import SubMenuSection from './SubMenuSection';
import { withNavigationTheme } from './storyDecorators';
import { sobreNos, nossasAcoes } from './mocks';

const meta = {
  title: 'Public/Navigation/SubMenuSection',
  component: SubMenuSection,
  decorators: [withNavigationTheme],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object' },
    closeMenu: { action: 'closeMenu' },
  },
} satisfies Meta<typeof SubMenuSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The section heading for the "O Projeto" branch. */
export const Default: Story = {
  args: {
    item: sobreNos,
  },
};

/** A shorter section, exercising a different title/description length. */
export const ShortDescription: Story = {
  args: {
    item: nossasAcoes,
  },
};
