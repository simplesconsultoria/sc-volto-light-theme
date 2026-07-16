import React from 'react';
import FontSizeControls from './FontSizeControls';
import HoverReaderControls from './HoverReaderControls';

const AccessibilityControls: React.FC = () => {
  return (
    <div className="header-accessibility-controls">
      <FontSizeControls />
      <HoverReaderControls />
    </div>
  );
};

export default AccessibilityControls;
