import type { ConfigType } from '@plone/registry';
import type { SCVLTSettings } from '../types/vlt';
import type { VLTSettings } from '@kitconcept/volto-light-theme/types';
import { bootstrapAccessibilityPreferences } from '../utils/preferences';

declare module '@plone/types' {
  interface SettingsConfig {
    vlt?: VLTSettings;
    scvlt?: SCVLTSettings;
  }
}

type Querystring = { [key: string]: string };

type apiExpanderInherit = {
  match: string;
  GET_CONTENT: string[];
  querystring:
    | Querystring
    | ((config: ConfigType, querystring: Querystring) => Querystring);
};

const INHERIT_BEHAVIORS_PARAM = 'expand.inherit.behaviors';

/**
 * Behaviors provided by kitconcept.voltolighttheme that this add-on replaces
 * with its own. They are dropped from the inherit expander so the backend does
 * not resolve them alongside ours.
 */
const SUPERSEDED_INHERIT_BEHAVIORS = [
  'voltolighttheme.header',
  'voltolighttheme.theme',
  'voltolighttheme.footer',
  'kitconcept.footer',
];

const FOOTER_BEHAVIOR = 'sc.voltolighttheme.footer';
const THEME_BEHAVIOR = 'sc.voltolighttheme.themeselector';

/**
 * Build the value of the `expand.inherit.behaviors` querystring parameter:
 * take whatever previous expanders already requested, drop the behaviors we
 * supersede, and append this add-on's own ones.
 */
export function inheritBehaviors(
  config: ConfigType,
  querystring: Querystring,
): string {
  const inherited = (querystring[INHERIT_BEHAVIORS_PARAM] ?? '')
    .split(',')
    .map((behavior) => behavior.trim())
    .filter(
      (behavior) =>
        behavior && !SUPERSEDED_INHERIT_BEHAVIORS.includes(behavior),
    );

  const local = [
    config.settings.scvlt?.headerBehavior,
    THEME_BEHAVIOR,
    FOOTER_BEHAVIOR,
  ].filter(Boolean) as string[];

  return [...new Set([...inherited, ...local])].join(',');
}

function applyExpanders(config: ConfigType) {
  config.settings.apiExpanders = [
    ...config.settings.apiExpanders,
    {
      match: '',
      GET_CONTENT: ['inherit'],
      querystring: (config, querystring) => ({
        [INHERIT_BEHAVIORS_PARAM]: inheritBehaviors(config, querystring),
      }),
    } as apiExpanderInherit,
  ];
}

export default function install(config: ConfigType) {
  bootstrapAccessibilityPreferences();

  if (config.settings.vlt) {
    config.settings.vlt.components = {
      ...config.settings.vlt.components,
      header: 'sc',
      navigation: 'sc',
    };
  }

  const scvltDefaults: SCVLTSettings = {
    headerBehavior: 'sc.voltolighttheme.siteheader',
    headerBar: {
      display: true,
      quickLinks: [],
      elements: {
        accessibilityControls: true,
        languageSelector: true,
        themeToggle: true,
        userTools: true,
      },
    },
  };

  const previousSettings = config.settings.scvlt;

  config.settings.scvlt = {
    ...scvltDefaults,
    ...previousSettings,
    headerBar: {
      ...scvltDefaults.headerBar,
      ...previousSettings?.headerBar,
      elements: {
        ...scvltDefaults.headerBar.elements,
        ...previousSettings?.headerBar?.elements,
      },
    },
  };

  applyExpanders(config);
  return config;
}
