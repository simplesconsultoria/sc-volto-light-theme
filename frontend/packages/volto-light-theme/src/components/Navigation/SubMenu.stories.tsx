import type { Decorator, Meta, StoryObj } from '@storybook/react';

import SubMenu from './SubMenu';
import { NavigationCanvas } from './storyDecorators';
import { sobreNos, nossasAcoes } from './mocks';

const withNavigationTheme: Decorator = (Story) => (
  <NavigationCanvas>
    <ul className="desktop-menu" style={{ listStyle: 'none', margin: 0 }}>
      <li>
        <Story />
      </li>
    </ul>
  </NavigationCanvas>
);

const meta = {
  title: 'Public/Navigation/SubMenu',
  component: SubMenu,
  decorators: [withNavigationTheme],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    index: { control: 'number' },
    desktopMenuOpen: { control: 'number' },
    pathname: { control: 'text' },
    item: { control: 'object' },
    closeMenu: { action: 'closeMenu' },
  },
} satisfies Meta<typeof SubMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open state: `desktopMenuOpen` equals `index`, so the panel is `active`. */
export const Open: Story = {
  args: {
    index: 0,
    desktopMenuOpen: 0,
    item: sobreNos,
    pathname: '/sobre-nos',
  },
};

/** Closed state: `desktopMenuOpen` differs from `index`. */
export const Closed: Story = {
  args: {
    index: 0,
    desktopMenuOpen: null,
    item: sobreNos,
    pathname: '/sobre-nos',
  },
};

/** A branch with a single child item. */
export const SingleChild: Story = {
  args: {
    index: 0,
    desktopMenuOpen: 0,
    item: nossasAcoes,
    pathname: '/nossas-acoes',
  },
};
