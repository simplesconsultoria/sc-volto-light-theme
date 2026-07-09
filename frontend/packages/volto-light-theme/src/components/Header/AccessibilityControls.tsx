import React from 'react';
import FontSizeControls from './AccessibilityControls/FontSizeControls';
import HoverReaderControls from './AccessibilityControls/HoverReaderControls';

const AccessibilityControls: React.FC = () => {
  return (
    <div className="header-accessibility-controls">
      <FontSizeControls />
      <HoverReaderControls />
    </div>
  );
};

export default AccessibilityControls;
