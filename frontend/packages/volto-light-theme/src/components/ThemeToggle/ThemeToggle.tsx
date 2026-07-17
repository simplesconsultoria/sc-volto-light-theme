import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';

import contrastSVG from '../../icons/contrast.svg';
import moonSVG from '../../icons/moon.svg';
import sunSVG from '../../icons/sun.svg';

type ThemeName = 'light' | 'dark' | 'high-contrast';

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

const isThemeName = (value: string | null): value is ThemeName =>
  value === 'light' || value === 'dark' || value === 'high-contrast';

const getInitialTheme = (): ThemeName => {
  if (typeof window === 'undefined') return 'light';

  try {
    const savedTheme = localStorage.getItem('theme');
    if (isThemeName(savedTheme)) return savedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
};

const applyTheme = (themeToApply: ThemeName) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  root.setAttribute('data-theme', themeToApply);
  body.setAttribute('data-theme', themeToApply);
};

const ThemeToggle: React.FC = () => {
  const intl = useIntl();
  const [theme, setTheme] = useState<ThemeName>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    applyTheme(theme);

    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore storage errors and keep the visual state.
    }
  }, [theme, mounted]);

  const selectTheme = (themeToApply: ThemeName) => {
    if (themeToApply !== theme) {
      setTheme(themeToApply);
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
    <>
      <Helmet>
        <script type="text/javascript">
          {`
            (function() {
              try {
                var savedTheme = localStorage.getItem('theme');
                var theme = 'light';
                if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'high-contrast') {
                  theme = savedTheme;
                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  theme = 'dark';
                }
                document.documentElement.setAttribute('data-theme', theme);
                document.body.setAttribute('data-theme', theme);
              } catch (e) {}
            })();
          `}
        </script>
      </Helmet>
      <div
        className="theme-toggle"
        role="group"
        aria-label={intl.formatMessage(messages.toggleTheme)}
      >
        <div
          className={`theme-toggle-segmented theme-toggle-segmented--${mounted ? theme : 'light'}`}
        >
          <span
            aria-hidden="true"
            className={`theme-toggle-segmented__indicator theme-toggle-segmented__indicator--${mounted ? theme : 'light'}`}
            style={{
              transform: `translateX(${mounted ? activeIndex * 100 : 0}%)`,
            }}
          />

          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                (mounted ? theme : 'light') === option.value
                  ? 'theme-toggle-segmented__option is-active'
                  : 'theme-toggle-segmented__option'
              }
              aria-pressed={(mounted ? theme : 'light') === option.value}
              aria-label={option.label}
              title={option.label}
              onClick={() => selectTheme(option.value)}
            >
              <Icon name={option.icon} size="18px" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ThemeToggle;
