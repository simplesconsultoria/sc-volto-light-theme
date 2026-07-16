import type { ConfigType } from '@plone/registry';
import type { SCVLTSettings } from '../types/vlt';
import type { VLTSettings } from '@kitconcept/volto-light-theme/types';

declare module '@plone/types' {
  interface SettingsConfig {
    vlt?: VLTSettings;
    scvlt?: SCVLTSettings;
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
  if (config.settings.vlt) {
    config.settings.vlt.components = {
      ...config.settings.vlt.components,
      header: 'sc',
      navigation: 'sc',
    };
  }

  config.settings.scvlt = {
    display: {
      accessibilityBar: true,
    },
  };

  applyExpanders(config);
  return config;
}
