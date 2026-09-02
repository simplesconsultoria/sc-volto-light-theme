import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import SubMenu from './SubMenu';
import { NavigationCanvas } from './storyDecorators';
import { aboutUs, ourWork, contact } from './mocks';

/**
 * The fat menu that drops from a top-level section.
 *
 * `SubMenu` renders `.submenu-wrapper` itself, but `_navigation.scss` only
 * reaches it through `#navigation.navigation`, so the canvas is required. The
 * panel is shown when `desktopMenuOpen` matches the item's `index`, which is why
 * the open state is a prop rather than something to click for.
 */

const withNavigation: Decorator = (Story) => (
  <Wrapper anonymous location="/">
    <NavigationCanvas>
      {/*
        `.submenu-wrapper` is `position: absolute; top: 100%` and the rule lives
        under `.desktop-menu`, so the panel needs both that ancestor and the
        `<li>` MenuItem renders it inside — otherwise it positions against the
        viewport and the close button lands in the wrong corner.
      */}
      <ul
        className="desktop-menu"
        style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
      >
        {/*
          The panel is `left: 50%; width: 100vw; translateX(-50%)`, so it centres
          on its own `<li>`. On a page that item sits mid-bar; a single item at
          the left edge would throw the panel off to the right.
        */}
        <li style={{ position: 'relative' }}>
          {/*
            The trigger MenuItem renders. Without it the `<li>` has no width —
            the panel is absolutely positioned — so the list collapses to zero
            and the panel centres on the wrong point.
          */}
          <span className="item">About Us</span>
          <Story />
        </li>
      </ul>
    </NavigationCanvas>
  </Wrapper>
);

const meta = {
  title: 'Public/Navigation/SubMenu',
  component: SubMenu,
  decorators: [withNavigation],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  args: {
    index: 0,
    pathname: '/',
    closeMenu: () => {},
  },
} satisfies Meta<typeof SubMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, with two children — the ordinary fat-menu case. */
export const Open: Story = {
  args: { item: aboutUs, desktopMenuOpen: 0 },
};

/** Closed. The panel stays in the DOM so the transition has something to animate. */
export const Closed: Story = {
  args: { item: aboutUs, desktopMenuOpen: null },
};

/** A single child, one of which carries an empty description. */
export const SingleChild: Story = {
  args: { item: ourWork, desktopMenuOpen: 0 },
};

/** A leaf section: no children, so the panel has only its header. */
export const NoChildren: Story = {
  args: { item: contact, desktopMenuOpen: 0 },
};

/** The current page sits inside this section, so a child is marked active. */
export const WithActiveChild: Story = {
  args: { item: aboutUs, desktopMenuOpen: 0, pathname: '/about-us/team' },
};
