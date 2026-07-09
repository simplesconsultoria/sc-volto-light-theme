import type { Decorator, Meta, StoryObj } from '@storybook/react';

import SubMenuItem from './SubMenuItem';
import { NavigationCanvas } from './storyDecorators';
import { manifesto, nossasAcoes } from './mocks';

/** SubMenuItem lives inside the `.submenu-items` grid. */
const withNavigationTheme: Decorator = (Story) => (
  <NavigationCanvas>
    <div className="submenu active submenu-content">
      <div className="submenu-items">
        <Story />
      </div>
    </div>
  </NavigationCanvas>
);

const meta = {
  title: 'Public/Navigation/SubMenuItem',
  component: SubMenuItem,
  decorators: [withNavigationTheme],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    pathname: { control: 'text' },
    item: { control: 'object' },
    closeMenu: { action: 'closeMenu' },
  },
} satisfies Meta<typeof SubMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: manifesto,
    pathname: '/sobre-nos',
  },
};

/** When `pathname` matches the item url, the `current` modifier is applied. */
export const Current: Story = {
  args: {
    item: manifesto,
    pathname: manifesto.url,
  },
};

/** Items whose description is empty render only the title. */
export const WithoutDescription: Story = {
  args: {
    item: nossasAcoes.items![0],
    pathname: '/',
  },
};
