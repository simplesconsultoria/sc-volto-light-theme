export type SCVLTSettings = {
  headerBehavior: string;
  headerBar: {
    display: boolean;
    quickLinks?: Array<{
      id?: string;
      label?: string;
      href?: string;
      component?: React.ComponentType<any>;
    }>;
    elements: {
      accessibilityControls: boolean;
      languageSelector: boolean;
      themeToggle: boolean;
      userTools: boolean;
    };
  };
};

/**
 * @deprecated Use `ThemeColors` from `../types/theme`, which mirrors
 * `ISCVLTThemeDefinition` exactly — this alias predates `header_foreground_color`.
 */
export type { ThemeColors as SiteThemeSettings } from './theme';
