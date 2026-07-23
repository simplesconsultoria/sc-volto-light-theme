export type SCVLTSettings = {
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
