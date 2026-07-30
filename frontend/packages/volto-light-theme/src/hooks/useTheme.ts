import * as React from 'react';
import { THEME_STORAGE_KEY, isThemeName } from '../utils/preferences';

// Observa o tema atual via data-theme no <html> e sincroniza com localStorage
const useTheme = () => {
  const [theme, setTheme] = React.useState('light');

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    // Tenta restaurar o tema salvo no localStorage
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeName(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch {
      // ignore
    }

    // Observa mudancas no atributo data-theme do <html>
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    return () => observer.disconnect();
  }, []);

  return theme;
};

export default useTheme;
