import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';

import { getStoredNumber, savePreference } from '../../../utils/storage';

const STORAGE_KEY = 'accessibility:font-scale';
const FONT_SCALE_MIN = 0.8;
const FONT_SCALE_MAX = 1.3;
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

  // Estado para armazenar o valor numérico
  const [fontScale, setFontScale] = useState<number>(() => {
    return Math.min(
      FONT_SCALE_MAX,
      Math.max(FONT_SCALE_MIN, getStoredNumber(STORAGE_KEY, 1)),
    );
  });

  // Estado para garantir que a renderização do texto "80%" não quebre a hidratação do Volto
  const [mounted, setMounted] = useState(false);

  const applyFontScale = useCallback((scale: number) => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--font-scale', String(scale));
    document.body.setAttribute('data-accessibility-font-scale', String(scale));
  }, []);

  const changeFontScale = useCallback(
    (nextScale: number) => {
      const boundedScale = Math.min(
        FONT_SCALE_MAX,
        Math.max(FONT_SCALE_MIN, nextScale),
      );
      // Arredonda para 1 casa decimal para evitar bugs do tipo 0.8999999
      const finalScale = Math.round(boundedScale * 10) / 10;

      setFontScale(finalScale);
      applyFontScale(finalScale);
      savePreference(STORAGE_KEY, String(finalScale));
    },
    [applyFontScale],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* O Helmet injeta esse script no <head> durante o SSR do Volto. 
          Isso garante que o CSS correto seja aplicado antes da tela pintar. */}
      <Helmet>
        <script type="text/javascript">
          {`
            (function() {
              try {
                var scale = localStorage.getItem('${STORAGE_KEY}') || '1';
                var boundedScale = Math.min(${FONT_SCALE_MAX}, Math.max(${FONT_SCALE_MIN}, Number(scale)));
                document.documentElement.style.setProperty('--font-scale', boundedScale);
                document.body.setAttribute('data-accessibility-font-scale', boundedScale);
              } catch (e) {}
            })();
          `}
        </script>
      </Helmet>

      <div className="header-accessibility-controls__group">
        <button
          type="button"
          className="header-accessibility-controls__button"
          onClick={() => changeFontScale(fontScale - FONT_SCALE_STEP)}
          title={intl.formatMessage(messages.decreaseFontSize)}
          aria-label={intl.formatMessage(messages.decreaseFontSize)}
        >
          A-
        </button>
        <span
          className="header-accessibility-controls__font-scale"
          aria-hidden="true"
        >
          {/* O mounted garante que o texto 100% seja renderizado no servidor, e no cliente ele atualize para o valor real */}
          {mounted ? `${Math.round(fontScale * 100)}%` : '100%'}
        </span>
        <button
          type="button"
          className="header-accessibility-controls__button"
          onClick={() => changeFontScale(fontScale + FONT_SCALE_STEP)}
          title={intl.formatMessage(messages.increaseFontSize)}
          aria-label={intl.formatMessage(messages.increaseFontSize)}
        >
          A+
        </button>
      </div>
    </>
  );
};

export default FontSizeControls;
