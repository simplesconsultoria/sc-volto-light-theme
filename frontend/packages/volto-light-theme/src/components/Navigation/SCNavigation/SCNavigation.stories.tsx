import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import SCNavigation from './SCNavigation';
import { NavigationGround } from './storyDecorators';
import { navigationItems } from './mocks';

/**
 * The site navigation, including the fat menu.
 *
 * `_navigation.scss` is scoped to `#navigation.navigation.scNavigation`, and
 * `SCNavigation` emits all three itself — so this story only needs the themed
 * ground behind it, not a second scope element.
 *
 * Items come from `state.navigation.items`, so the store is seeded rather than
 * the items passed as a prop.
 */

const store = {
  navigation: { items: navigationItems },
  content: { data: { '@id': '/', '@type': 'Plone Site', title: 'Site' } },
};

const withNavigation: Decorator = (Story) => (
  <Wrapper anonymous customStore={store} location="/">
    <NavigationGround>
      <Story />
    </NavigationGround>
  </Wrapper>
);

const meta = {
  title: 'Public/Navigation/Navigation',
  component: SCNavigation,
  decorators: [withNavigation],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
} satisfies Meta<typeof SCNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing selected — the state a visitor sees on the front page. */
export const Default: Story = {
  args: { pathname: '/' },
};

/**
 * A section is current. `MenuItem` compares `pathname` against each item's
 * `url` to mark the active trail.
 */
export const SectionActive: Story = {
  args: { pathname: '/about-us' },
};

/** A leaf inside a section, so the parent is active by prefix rather than exactly. */
export const LeafActive: Story = {
  args: { pathname: '/about-us/team' },
};

/** A section with no children renders as a plain link, with no fat menu. */
export const LeafSectionActive: Story = {
  args: { pathname: '/contact' },
};
