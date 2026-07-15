import type { ConfigType } from '@plone/registry';
import type { VLTSettings } from '../types/vlt';

declare module '@plone/types' {
  interface SettingsConfig {
    vlt?: VLTSettings;
  }
}

export default function install(config: ConfigType) {
  config.settings.vlt = {
    components: {
      header: 'sc',
      navigation: 'sc',
      mobileNavigation: 'vlt',
      footer: 'vlt',
    },
    display: {
      accessibilityBar: true,
    },
  };
  return config;
}
