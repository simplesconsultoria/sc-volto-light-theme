import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import SubMenuItems from './SubMenuItems';
import { NavigationCanvas } from './storyDecorators';
import { aboutUs, navigationItems } from './mocks';

/**
 * The grid of links inside a fat menu.
 *
 * Rendered inside `.submenu-content`, which is where `_navigation.scss` expects
 * `.submenu-items` to sit; without that ancestor the grid collapses to a stack.
 */
const withPanel: Decorator = (Story) => (
  <Wrapper anonymous location="/">
    <NavigationCanvas>
      <div className="desktop-menu">
        <div className="submenu-wrapper">
          <div className="submenu active">
            <div className="submenu-inner">
              <div className="submenu-content">
                <Story />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationCanvas>
  </Wrapper>
);

const meta = {
  title: 'Public/Navigation/SubMenuItems',
  component: SubMenuItems,
  decorators: [withPanel],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { pathname: '/', closeMenu: () => {} },
} satisfies Meta<typeof SubMenuItems>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two items, both with descriptions. */
export const TwoItems: Story = { args: { items: aboutUs.items ?? [] } };

/** One item whose description is empty, to show the layout without it. */
export const MissingDescription: Story = {
  args: { items: [{ ...aboutUs.items![0], description: '' }] },
};

/** Enough items to wrap onto a second row. */
export const ManyItems: Story = {
  args: {
    items: [...(aboutUs.items ?? []), ...navigationItems].slice(0, 5),
  },
};

/** One of the links is the current page. */
export const WithActive: Story = {
  args: { items: aboutUs.items ?? [], pathname: '/about-us/team' },
};
