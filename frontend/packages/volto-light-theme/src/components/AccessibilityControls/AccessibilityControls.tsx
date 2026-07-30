import React from 'react';
import FontSizeControls from './FontSizeControls';
import HoverReaderControls from './HoverReaderControls';

const AccessibilityControls: React.FC = () => {
  return (
    <>
      <FontSizeControls />
      <HoverReaderControls />
    </>
  );
};

export default AccessibilityControls;
