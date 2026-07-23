import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';

import contrastSVG from '../../icons/contrast.svg';
import moonSVG from '../../icons/moon.svg';
import sunSVG from '../../icons/sun.svg';
import {
  applyTheme,
  getAppliedTheme,
  resolveThemePreference,
  THEME_STORAGE_KEY,
  type ThemeName,
} from '../../utils/preferences';
import { savePreference } from '../../utils/storage';

type ThemeOption = {
  value: ThemeName;
  label: string;
  icon: string;
};

const messages = defineMessages({
  toggleTheme: {
    id: 'toggleTheme',
    defaultMessage: 'Alternar tema',
  },
  lightTheme: {
    id: 'lightTheme',
    defaultMessage: 'Claro',
  },
  darkTheme: {
    id: 'darkTheme',
    defaultMessage: 'Escuro',
  },
  highContrastTheme: {
    id: 'highContrastTheme',
    defaultMessage: 'Alto contraste',
  },
});

const ThemeToggle: React.FC = () => {
  const intl = useIntl();
  const [theme, setTheme] = useState<ThemeName>('light');

  useEffect(() => {
    const actualTheme = getAppliedTheme() ?? resolveThemePreference();
    if (actualTheme !== 'light') {
      setTheme(actualTheme);
    }
  }, []);

  const selectTheme = (themeToApply: ThemeName) => {
    if (themeToApply !== theme) {
      setTheme(themeToApply);
      applyTheme(themeToApply);
      savePreference(THEME_STORAGE_KEY, themeToApply);
    }
  };

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: intl.formatMessage(messages.lightTheme),
      icon: sunSVG,
    },
    {
      value: 'dark',
      label: intl.formatMessage(messages.darkTheme),
      icon: moonSVG,
    },
    {
      value: 'high-contrast',
      label: intl.formatMessage(messages.highContrastTheme),
      icon: contrastSVG,
    },
  ];

  const activeIndex = Math.max(
    themeOptions.findIndex((option) => option.value === theme),
    0,
  );

  return (
    <div
      className="theme-toggle"
      role="group"
      aria-label={intl.formatMessage(messages.toggleTheme)}
    >
      <div
        className={`theme-toggle-segmented theme-toggle-segmented--${theme}`}
      >
        <span
          aria-hidden="true"
          className={`theme-toggle-segmented__indicator theme-toggle-segmented__indicator--${theme}`}
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              theme === option.value
                ? 'theme-toggle-segmented__option is-active'
                : 'theme-toggle-segmented__option'
            }
            aria-pressed={theme === option.value}
            aria-label={option.label}
            title={option.label}
            onClick={() => selectTheme(option.value)}
          >
            <Icon name={option.icon} size="18px" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;
