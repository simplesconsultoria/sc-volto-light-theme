import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';

import speedSVG from '../../icons/speed.svg';
import earSVG from '../../icons/ear.svg';
import {
  isSpeechSupported,
  ensureVoicesLoaded,
  configurePortugueseUtterance,
} from '../../utils/speechSynthesis';

import {
  getStoredNumber,
  getStoredBoolean,
  savePreference,
} from '../../utils/storage';

const STORAGE_KEYS = {
  hoverReaderEnabled: 'accessibility:hover-reader-enabled',
  hoverReaderRate: 'accessibility:hover-reader-rate',
};

const RATE_MIN = 0.6;
const RATE_MAX = 1.4;
const DEFAULT_RATE = 1;
const TEXT_TARGET_SELECTOR =
  'h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, td, th, figcaption, blockquote, div';
const messages = defineMessages({
  hoverReaderLabel: {
    id: 'accessibilityHoverReaderLabel',
    defaultMessage: 'Leitura ao passar o mouse',
  },
  speedLabel: {
    id: 'accessibilitySpeedLabel',
    defaultMessage: 'Velocidade do leitor',
  },
});

const HoverReaderControls: React.FC = () => {
  const intl = useIntl();
  const hoverTimeoutRef = useRef<number | null>(null);
  const lastHoverTextRef = useRef<string>('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [hoverReaderEnabled, setHoverReaderEnabled] = useState(false);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const ratePercent = Math.round(rate * 100);

  const stopSpeaking = useCallback(() => {
    if (!isSpeechSupported()) return;
    window.speechSynthesis.cancel();
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!isSpeechSupported() || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      configurePortugueseUtterance(utterance, rate);
      window.speechSynthesis.speak(utterance);
    },
    [rate],
  );

  useEffect(() => {
    setSpeechSupported(isSpeechSupported());

    const initialHoverReader = getStoredBoolean(
      STORAGE_KEYS.hoverReaderEnabled,
      false,
    );
    const initialRate = Math.min(
      RATE_MAX,
      Math.max(RATE_MIN, getStoredNumber(STORAGE_KEYS.hoverReaderRate, 1)),
    );

    setHoverReaderEnabled(initialHoverReader);
    setRate(initialRate);
  }, []);

  useEffect(() => {
    return ensureVoicesLoaded();
  }, []);

  useEffect(() => {
    if (!speechSupported || !hoverReaderEnabled) return undefined;

    const onMouseOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const ignoredSelector = '[aria-hidden="true"], script, style, noscript';
      if (target.closest(ignoredSelector)) return;

      const textElement = target.closest<HTMLElement>(TEXT_TARGET_SELECTOR);
      if (!textElement) return;
      if (
        textElement.tagName.toLowerCase() === 'div' &&
        textElement.children.length > 0
      ) {
        return;
      }

      const text = textElement.textContent?.replace(/\s+/g, ' ').trim() ?? '';

      if (!text || text.length < 3 || text.length > 220) return;
      if (text === lastHoverTextRef.current) return;

      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }

      hoverTimeoutRef.current = window.setTimeout(() => {
        lastHoverTextRef.current = text;
        speakText(text);
      }, 250);
    };

    document.body.addEventListener('mouseover', onMouseOver);

    return () => {
      document.body.removeEventListener('mouseover', onMouseOver);
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hoverReaderEnabled, speakText, speechSupported]);

  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  const onToggleHoverReader = useCallback(() => {
    const next = !hoverReaderEnabled;
    setHoverReaderEnabled(next);
    savePreference(STORAGE_KEYS.hoverReaderEnabled, String(next));
    if (!next) {
      stopSpeaking();
    }
  }, [hoverReaderEnabled, stopSpeaking]);

  const onChangeRate = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextRate = Number(event.target.value);
      setRate(nextRate);
      savePreference(STORAGE_KEYS.hoverReaderRate, String(nextRate));
    },
    [],
  );

  return (
    <div className="header-accessibility-controls__group">
      <button
        type="button"
        className={`header-accessibility-controls__button header-accessibility-controls__hover-button ${hoverReaderEnabled ? 'is-active' : ''}`}
        onClick={onToggleHoverReader}
        disabled={!speechSupported}
        aria-pressed={hoverReaderEnabled}
        aria-label={intl.formatMessage(messages.hoverReaderLabel)}
        data-tooltip={intl.formatMessage(messages.hoverReaderLabel)}
        data-position="bottom center"
      >
        <Icon name={earSVG} size="24px" />
      </button>

      <div
        className={`header-accessibility-controls__hover-options ${hoverReaderEnabled ? 'is-open' : ''}`}
        aria-hidden={!hoverReaderEnabled}
      >
        <label className="header-accessibility-controls__range">
          <span
            aria-hidden="true"
            className="header-accessibility-controls__icon"
          >
            <Icon name={speedSVG} size="38px" style={{ fill: 'unset' }} />
          </span>
          <input
            type="range"
            min={0.6}
            max={1.4}
            step="0.1"
            value={rate}
            onChange={onChangeRate}
            disabled={!speechSupported || !hoverReaderEnabled}
            aria-label={intl.formatMessage(messages.speedLabel)}
          />
          <span aria-hidden="true">{ratePercent}%</span>
        </label>
      </div>
    </div>
  );
};

export default HoverReaderControls;
