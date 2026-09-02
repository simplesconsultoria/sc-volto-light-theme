import React from 'react';
import type { Decorator } from '@storybook/react';

import { createThemeDefinition } from '../config/blocks';
import { themeCustomProperties } from '../helpers/themeStyles';
import {
  defaultTheme,
  corporateTheme,
  natalTheme,
} from '../components/Controlpanels/Themes/fixtures';
import type { ThemeSettings } from '../types/theme';

/**
 * Storybook decorator that puts a story in the same styling context a block has
 * on a real page.
 *
 * Three things a bare story does not get:
 *
 * 1. **A colour mode.** This has to be applied to `document.documentElement`,
 *    not to a wrapper. Upstream VLT registers six tokens with
 *    `@property { syntax: '<color>' }` — `--primary-color`,
 *    `--primary-foreground-color`, `--secondary-color`,
 *    `--secondary-foreground-color`, `--accent-color` and
 *    `--accent-foreground-color`. A *registered* custom property is computed
 *    eagerly at the element that declares it, so its `light-dark()` is resolved
 *    once at `:root` and inherited as a flat colour; a descendant that changes
 *    `color-scheme` cannot make it re-resolve. Setting the mode on the root is
 *    also what a real page does.
 * 2. **A block theme.** `--theme-*` is only defined when a themed block wrapper
 *    supplies it. Stories render views bare, so all 14 properties are undefined
 *    and every themed colour silently falls back — which is how six missing
 *    focus outlines went unnoticed.
 * 3. **A site theme.** The Themes control panel sends `ISCVLTThemeDefinition`
 *    records; applying one is what a real site does.
 *
 * It also constrains every story to `--default-container-width` and centres it,
 * so components are seen at the measure they occupy on a page rather than
 * stretched across the viewport. A story that is genuinely full-bleed — the page
 * views, the header bar — can opt out with `parameters: { fullBleed: true }`.
 */

/** The colour modes `_root.scss` defines a `[data-theme]` block for. */
const COLOR_MODES = {
  light: 'light',
  dark: 'dark',
  'high-contrast': 'dark',
} as const;

type ColorMode = keyof typeof COLOR_MODES;

/** Site themes offered in the toolbar, shaped as the control panel serves them. */
const SITE_THEMES: Record<string, ThemeSettings | null> = {
  none: null,
  default: defaultTheme,
  corporate: corporateTheme,
  natal: natalTheme,
};

/**
 * Build the inline custom properties for one block theme.
 *
 * Reuses `createThemeDefinition` rather than restating the mapping, so a theme
 * added in `config/blocks.ts` needs no change here.
 */
function blockThemeStyle(name: string): Record<string, string> {
  if (name === 'none') return {};
  return createThemeDefinition(name, name).style;
}

export const globalTypes = {
  colorMode: {
    name: 'Colour mode',
    description: 'light-dark() resolution and [data-theme] overrides',
    defaultValue: 'light',
    toolbar: {
      icon: 'contrast',
      dynamicTitle: true,
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
        { value: 'high-contrast', title: 'High contrast' },
      ],
    },
  },
  blockTheme: {
    name: 'Block theme',
    description: 'The --theme-* mapping a themed block carries',
    defaultValue: 'default',
    toolbar: {
      icon: 'paintbrush',
      dynamicTitle: true,
      items: [
        { value: 'none', title: 'No block theme' },
        { value: 'default', title: 'Primary' },
        { value: 'brand', title: 'Brand' },
      ],
    },
  },
  siteTheme: {
    name: 'Site theme',
    description: 'An ISCVLTThemeDefinition record from the control panel',
    defaultValue: 'none',
    toolbar: {
      icon: 'globe',
      dynamicTitle: true,
      items: [
        { value: 'none', title: 'Stylesheet defaults' },
        { value: 'default', title: 'Default' },
        { value: 'corporate', title: 'Corporate' },
        { value: 'natal', title: 'Natal' },
      ],
    },
  },
};

/**
 * The themed shell a story renders inside.
 *
 * A real component rather than inline decorator code, so it may use hooks.
 */
function ThemedStory({
  colorMode,
  blockTheme,
  siteTheme,
  fullBleed,
  children,
}: {
  colorMode: ColorMode;
  blockTheme: string;
  siteTheme: string;
  fullBleed: boolean;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-theme');
    root.setAttribute('data-theme', colorMode);
    root.style.colorScheme = COLOR_MODES[colorMode] ?? 'light';
    return () => {
      if (previous === null) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', previous);
      root.style.colorScheme = '';
    };
  }, [colorMode]);

  // Unregistered properties resolve where they are *used*, so they need the
  // colour scheme here too: Storybook's preview resets `color-scheme` below
  // `<html>`, which would otherwise leave them resolving in light mode however
  // the root is set. Registered properties were already fixed at `:root` above,
  // so between the two every token follows the toolbar.
  const style = {
    colorScheme: COLOR_MODES[colorMode] ?? 'light',
    background: 'var(--primary-color)',
    color: 'var(--primary-foreground-color)',
    minHeight: '100vh',
    ...blockThemeStyle(blockTheme),
    ...themeCustomProperties(SITE_THEMES[siteTheme]),
  } as React.CSSProperties;

  return (
    <div style={style}>
      <div
        style={{ maxWidth: 'var(--default-container-width)', margin: '0 auto' }}
      >
        {children}
      </div>
    </div>
  );
}

export const withTheme: Decorator = (Story, context) => (
  <ThemedStory
    colorMode={(context.globals.colorMode ?? 'light') as ColorMode}
    blockTheme={(context.globals.blockTheme ?? 'default') as string}
    siteTheme={(context.globals.siteTheme ?? 'none') as string}
    fullBleed={Boolean(context.parameters?.fullBleed)}
  >
    <Story />
  </ThemedStory>
);

export default withTheme;
