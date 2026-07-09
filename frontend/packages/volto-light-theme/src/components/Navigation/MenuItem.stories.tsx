import type { Decorator, Meta, StoryObj } from '@storybook/react';

import MenuItem from './MenuItem';
import { NavigationCanvas } from './storyDecorators';
import { sobreNos, contato } from './mocks';

const withNavigationTheme: Decorator = (Story) => (
  <NavigationCanvas>
    <ul className="desktop-menu" style={{ listStyle: 'none', margin: 0 }}>
      <Story />
    </ul>
  </NavigationCanvas>
);

const meta = {
  title: 'Public/Navigation/MenuItem',
  component: MenuItem,
  decorators: [withNavigationTheme],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    index: { control: 'number' },
    hasFatMenu: { control: 'boolean' },
    desktopMenuOpen: { control: 'number' },
    pathname: { control: 'text' },
    lang: { control: 'text' },
    item: { control: 'object' },
    openMenu: { action: 'openMenu' },
    closeMenu: { action: 'closeMenu' },
  },
  args: {
    lang: 'pt-br',
  },
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A leaf item (no children) renders as a plain `NavItem` link. */
export const SimpleLink: Story = {
  args: {
    index: 0,
    hasFatMenu: false,
    desktopMenuOpen: null,
    item: contato,
    pathname: '/',
  },
};

/** With the fat menu enabled and children present, it renders a toggle button. */
export const FatMenuClosed: Story = {
  args: {
    index: 0,
    hasFatMenu: true,
    desktopMenuOpen: null,
    item: sobreNos,
    pathname: '/',
  },
};

/** The same item with its fat menu panel expanded. */
export const FatMenuOpen: Story = {
  args: {
    index: 0,
    hasFatMenu: true,
    desktopMenuOpen: 0,
    item: sobreNos,
    pathname: '/sobre-nos',
  },
};

/**
 * A section item with the fat menu disabled falls back to a plain link,
 * ignoring its children.
 */
export const FatMenuDisabledWithChildren: Story = {
  args: {
    index: 0,
    hasFatMenu: false,
    desktopMenuOpen: null,
    item: sobreNos,
    pathname: '/',
  },
};
