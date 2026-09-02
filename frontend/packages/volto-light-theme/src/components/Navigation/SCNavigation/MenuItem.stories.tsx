import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import MenuItem from './MenuItem';
import { NavigationCanvas } from './storyDecorators';
import { aboutUs, contact } from './mocks';

/**
 * One top-level entry in the navigation bar.
 *
 * `hasFatMenu` decides whether it renders a button that opens a panel or a plain
 * link. `MenuItem` is an `<li>`, so the canvas nests it in the `ul.desktop-menu`
 * `_navigation.scss` expects.
 */
const withMenu: Decorator = (Story) => (
  <Wrapper anonymous location="/">
    <NavigationCanvas>
      <ul className="desktop-menu">
        <Story />
      </ul>
    </NavigationCanvas>
  </Wrapper>
);

const meta = {
  title: 'Public/Navigation/MenuItem',
  component: MenuItem,
  decorators: [withMenu],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    index: 0,
    pathname: '/',
    lang: 'en',
    desktopMenuOpen: null,
    openMenu: () => {},
    closeMenu: () => {},
  },
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A section with children: renders the fat-menu trigger. */
export const WithFatMenu: Story = {
  args: { item: aboutUs, hasFatMenu: true },
};

/** The same entry with its panel open. */
export const FatMenuOpen: Story = {
  args: { item: aboutUs, hasFatMenu: true, desktopMenuOpen: 0 },
};

/** A leaf section: a plain link, no trigger. */
export const PlainLink: Story = {
  args: { item: contact, hasFatMenu: false },
};

/** The current page, so the entry carries the active treatment. */
export const Active: Story = {
  args: { item: aboutUs, hasFatMenu: true, pathname: '/about-us' },
};
