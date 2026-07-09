import React from 'react';
import { Container } from '@plone/components';
import Anontools from '@plone/volto/components/theme/Anontools/Anontools';
import LanguageSelector from '@plone/volto/components/theme/LanguageSelector/LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import AccessibilityControls from './AccessibilityControls';

type AccessibilityBarProps = {
  token?: string | null;
};

const AccessibilityBar: React.FC<AccessibilityBarProps> = ({ token }) => {
  return (
    <div className="header-accessibility-bar">
      <Container layout>
        <div className="header-accessibility">
          <div className="header-accessibility__actions">
            <LanguageSelector />
            <ThemeToggle />
            <AccessibilityControls />

            {token && (
              <div className="header-accessibility__tools">
                <Anontools />
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AccessibilityBar;
