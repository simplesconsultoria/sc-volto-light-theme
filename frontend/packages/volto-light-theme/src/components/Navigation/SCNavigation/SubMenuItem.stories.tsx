import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import SubMenuItem from './SubMenuItem';
import { NavigationCanvas } from './storyDecorators';
import { mission, aboutUs } from './mocks';

/**
 * A single link inside a fat menu — title, optional description, and the active
 * treatment when it is the current page.
 */
const withPanel: Decorator = (Story) => (
  <Wrapper anonymous location="/">
    <NavigationCanvas>
      <div className="desktop-menu">
        <div className="submenu-wrapper">
          <div className="submenu active">
            <div className="submenu-inner">
              <div className="submenu-content">
                <div className="submenu-items">
                  <Story />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationCanvas>
  </Wrapper>
);

const meta = {
  title: 'Public/Navigation/SubMenuItem',
  component: SubMenuItem,
  decorators: [withPanel],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { pathname: '/', closeMenu: () => {} },
} satisfies Meta<typeof SubMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { item: mission } };

export const Active: Story = {
  args: { item: mission, pathname: '/about-us/mission' },
};

export const WithoutDescription: Story = {
  args: { item: { ...mission, description: '' } },
};

/** A long title and description, to show the wrapping. */
export const LongText: Story = {
  args: { item: { ...aboutUs, items: [] } },
};
