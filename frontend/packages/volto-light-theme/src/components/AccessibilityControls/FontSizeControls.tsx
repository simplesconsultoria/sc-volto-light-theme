import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { savePreference } from '../../utils/storage';
import {
  applyFontScale,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STORAGE_KEY,
  getStoredFontScale,
  normalizeFontScale,
} from '../../utils/preferences';

const FONT_SCALE_STEP = 0.1;
const messages = defineMessages({
  increaseFontSize: {
    id: 'accessibilityIncreaseFontSize',
    defaultMessage: 'Aumentar fonte',
  },
  decreaseFontSize: {
    id: 'accessibilityDecreaseFontSize',
    defaultMessage: 'Diminuir fonte',
  },
});

const FontSizeControls: React.FC = () => {
  const intl = useIntl();

  const [fontScale, setFontScale] = useState<number>(() => {
    return getStoredFontScale();
  });

  const changeFontScale = useCallback((nextScale: number) => {
    const finalScale = normalizeFontScale(nextScale);

    setFontScale(finalScale);
    applyFontScale(finalScale);
    savePreference(FONT_SCALE_STORAGE_KEY, String(finalScale));
  }, []);

  const canDecrease = fontScale > FONT_SCALE_MIN;
  const canIncrease = fontScale < FONT_SCALE_MAX;

  return (
    <div className="header-accessibility-controls__group">
      <button
        type="button"
        className="header-accessibility-controls__button"
        onClick={() => changeFontScale(fontScale - FONT_SCALE_STEP)}
        disabled={!canDecrease}
        title={intl.formatMessage(messages.decreaseFontSize)}
        aria-label={intl.formatMessage(messages.decreaseFontSize)}
      >
        A-
      </button>
      <span
        className="header-accessibility-controls__font-scale"
        aria-live="polite"
        suppressHydrationWarning
      >
        {`${Math.round(fontScale * 100)}%`}
      </span>
      <button
        type="button"
        className="header-accessibility-controls__button"
        onClick={() => changeFontScale(fontScale + FONT_SCALE_STEP)}
        disabled={!canIncrease}
        title={intl.formatMessage(messages.increaseFontSize)}
        aria-label={intl.formatMessage(messages.increaseFontSize)}
      >
        A+
      </button>
    </div>
  );
};

export default FontSizeControls;
