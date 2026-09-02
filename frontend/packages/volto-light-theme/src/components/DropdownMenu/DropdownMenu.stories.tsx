import React from 'react';
import DropdownMenu from './DropdownMenu';
import type { Meta, StoryObj } from '@storybook/react';

// Dumb link component to bypass Redux/Volto router dependencies
const MockLink: React.FC<any> = ({ href, children, onClick, ...props }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick(e);
    }}
    {...props}
  >
    {children}
  </a>
);

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    title: 'Portais',
    LinkComponent: MockLink,
    links: [
      { title: 'Transparency Portal', href: '/transparency' },
      { title: 'Dados Abertos', href: '/dados' },
      { title: 'Official Gazette', href: '/official-gazette' },
    ],
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Acessibilidade',
    LinkComponent: MockLink,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
    links: [
      { title: 'Alto Contraste', href: '/alto-contraste' },
      { title: 'Libras', href: '/libras' },
    ],
  },
};

export const CustomChildren: Story = {
  args: {
    title: 'Custom Content',
    children: (
      <div
        style={{
          padding: '1rem',
          background: 'var(--neutral-color)',
          color: 'var(--neutral-foreground-color)',
        }}
      >
        <strong>Hello!</strong> This is arbitrary React content inside the
        dropdown panel.
      </div>
    ),
  },
};
