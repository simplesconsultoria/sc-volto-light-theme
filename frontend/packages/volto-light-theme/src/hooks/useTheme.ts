import { useEffect, useState } from 'react';

const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme');
      if (
        savedTheme === 'light' ||
        savedTheme === 'dark' ||
        savedTheme === 'high-contrast'
      ) {
        setTheme(savedTheme);
      }
    } catch {
      // ignore
    }

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
