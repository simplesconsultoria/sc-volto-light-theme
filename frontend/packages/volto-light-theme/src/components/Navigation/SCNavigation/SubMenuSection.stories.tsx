import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import SubMenuSection from './SubMenuSection';
import { NavigationCanvas } from './storyDecorators';
import { aboutUs, ourWork, contact } from './mocks';

/**
 * The header of a fat menu: a "Section" label, the section title as a link, and
 * its description.
 *
 * The label is the one translatable string here — `Section`, via `defineMessages`.
 */
const withPanel: Decorator = (Story) => (
  <Wrapper anonymous location="/">
    <NavigationCanvas>
      <div className="desktop-menu">
        <div className="submenu-wrapper">
          <div className="submenu active">
            <div className="submenu-inner">
              <Story />
            </div>
          </div>
        </div>
      </div>
    </NavigationCanvas>
  </Wrapper>
);

const meta = {
  title: 'Public/Navigation/SubMenuSection',
  component: SubMenuSection,
  decorators: [withPanel],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { closeMenu: () => {} },
} satisfies Meta<typeof SubMenuSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDescription: Story = { args: { item: aboutUs } };

export const ShortDescription: Story = { args: { item: ourWork } };

/** A long description, to show where it wraps. */
export const LongDescription: Story = { args: { item: contact } };

export const WithoutDescription: Story = {
  args: { item: { ...aboutUs, description: '' } },
};
