import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Container } from '@plone/components';
import config from '@plone/volto/registry';
import Anontools from '@plone/volto/components/theme/Anontools/Anontools';
import LanguageSelector from '@plone/volto/components/theme/LanguageSelector/LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import AccessibilityControls from './AccessibilityControls';
import type { Content } from '@plone/types';

type AccessibilityBarProps = {
  content?: Content;
  location?: any;
};

const AccessibilityBar: React.FC<AccessibilityBarProps> = (props) => {
  const token = useSelector(
    (state: any) => state.userSession.token,
    shallowEqual,
  );
  const { vlt } = config.settings;
  const displayAccessibilityBar = vlt?.display?.accessibilityBar ?? false;

  return displayAccessibilityBar ? (
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
  ) : null;
};

export default AccessibilityBar;
