import React from 'react';
import HeaderBarActionsUI from './HeaderBarActionsUI';
import type { Meta, StoryObj } from '@storybook/react';

import ThemeToggle from '../ThemeToggle/ThemeToggle';
import AccessibilityControls from '../AccessibilityControls/AccessibilityControls';

// Dumb components to mock the complex ones that require Volto/Redux context
const MockLink: React.FC<any> = ({ href, children, className }) => (
  <a href={href} className={className} onClick={(e) => e.preventDefault()}>
    {children}
  </a>
);

const MockLanguageSelector = () => (
  <div className="language-selector">
    <a href="/pt-br" onClick={(e) => e.preventDefault()}>
      PT-BR
    </a>
  </div>
);
const MockAnontools = () => (
  <div className="anontools">
    <a href="/login" onClick={(e) => e.preventDefault()}>
      Entrar
    </a>
  </div>
);

const meta: Meta<typeof HeaderBarActionsUI> = {
  title: 'Components/HeaderBarActions',
  component: HeaderBarActionsUI,
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#e0e0e0',
        }}
      >
        <header className="header-wrapper" style={{ width: '100%' }}>
          <div className="header-bar-wrapper">
            <div className="header-bar">
              <div className="header-bar__inner">
                <div className="header-bar__actions">
                  <Story />
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof HeaderBarActionsUI>;

export const Default: Story = {
  args: {
    quickLinks: [
      { label: 'Ouvidoria', href: '/ouvidoria' },
      { label: 'Acesso à Informação', href: '/acesso-a-informacao' },
    ],
    features: {
      languageSelector: true,
      themeToggle: true,
      accessibilityControls: true,
      userTools: true,
    },
    LinkComponent: MockLink,
    LanguageSelectorComponent: MockLanguageSelector,
    ThemeToggleComponent: ThemeToggle,
    AccessibilityControlsComponent: AccessibilityControls,
    AnontoolsComponent: MockAnontools,
  },
};
