import type { ConfigType } from '@plone/registry';
import type { VLTSettings } from '../types/vlt';

declare module '@plone/types' {
  interface SettingsConfig {
    vlt?: VLTSettings;
  }
}

type apiExpanderInherit = {
  match: string;
  GET_CONTENT: string[];
  querystring:
    | { [key: string]: string }
    | ((
        config: ConfigType,
        querystring: { config: ConfigType; querystring: object },
      ) => { [key: string]: string });
};

function applyExpanders(config: ConfigType) {
  const EXPANDERS_INHERIT_BEHAVIORS = 'sc.voltolighttheme.footer';
  config.settings.apiExpanders = [
    ...config.settings.apiExpanders,
    {
      match: '',
      GET_CONTENT: ['inherit'],
      querystring: (config, querystring) => {
        if (querystring['expand.inherit.behaviors']) {
          return {
            'expand.inherit.behaviors': querystring[
              'expand.inherit.behaviors'
            ].concat(',', EXPANDERS_INHERIT_BEHAVIORS),
          };
        } else {
          return {
            'expand.inherit.behaviors': EXPANDERS_INHERIT_BEHAVIORS,
          };
        }
      },
    } as apiExpanderInherit,
  ];
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
  applyExpanders(config);
  return config;
}
