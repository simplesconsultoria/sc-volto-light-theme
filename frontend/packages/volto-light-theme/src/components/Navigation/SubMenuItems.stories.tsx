import type { Meta, StoryObj } from '@storybook/react';

import SubMenuItems from './SubMenuItems';
import { withNavigationTheme } from './storyDecorators';
import { sobreNos, nossasAcoes } from './mocks';

const meta = {
  title: 'Public/Navigation/SubMenuItems',
  component: SubMenuItems,
  decorators: [withNavigationTheme],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    pathname: { control: 'text' },
    items: { control: 'object' },
    closeMenu: { action: 'closeMenu' },
  },
} satisfies Meta<typeof SubMenuItems>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two children laid out in the two-column grid. */
export const Default: Story = {
  args: {
    items: sobreNos.items,
    pathname: '/sobre-nos',
  },
};

/** A single child, one column filled. */
export const SingleItem: Story = {
  args: {
    items: nossasAcoes.items,
    pathname: '/nossas-acoes',
  },
};

/** No children: the container renders empty. */
export const Empty: Story = {
  args: {
    items: [],
    pathname: '/',
  },
};
