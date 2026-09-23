import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  selectLayout: {
    id: 'Select layout',
    defaultMessage: 'Select layout',
  },
});

// Layout variants available for selection on block creation
export const LAYOUT_VARIANTS = [
  { id: '1', title: '100%' },
  { id: '1-1', title: '50 / 50' },
  { id: '1-2', title: '33 / 66' },
  { id: '2-1', title: '66 / 33' },
  { id: '1-4', title: '20 / 80' },
  { id: '4-1', title: '80 / 20' },
  { id: '2-3', title: '40 / 60' },
  { id: '3-2', title: '60 / 40' },
  { id: '1-1-1', title: '33 / 33 / 33' },
  { id: '2-1-1', title: '50 / 25 / 25' },
  { id: '1-2-1', title: '25 / 50 / 25' },
  { id: '1-1-2', title: '25 / 25 / 50' },
  { id: '1-1-1-1', title: '25 / 25 / 25 / 25' },
];

/**
 * LayoutSelector - Initial layout picker shown when the block is first added.
 * Renders a grid of clickable cards, each representing a layout preset.
 */
const LayoutSelector = ({
  onSelect,
}: {
  onSelect: (layoutId: string) => void;
}) => {
  const intl = useIntl();

  return (
    <div className="custom-grid-layout-selector">
      <h4>{intl.formatMessage(messages.selectLayout)}:</h4>
      <div className="layout-options">
        {LAYOUT_VARIANTS.map((variant) => (
          <button
            key={variant.id}
            className="layout-option"
            onClick={() => onSelect(variant.id)}
            type="button"
            aria-label={variant.title}
          >
            <div className="layout-preview">
              {/* Visual representation of the layout proportions */}
              {variant.id.split('-').map((weight, i) => (
                <div
                  key={i}
                  className="layout-preview-col"
                  style={{ flex: parseInt(weight, 10) }}
                />
              ))}
            </div>
            <span className="layout-label">{variant.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
