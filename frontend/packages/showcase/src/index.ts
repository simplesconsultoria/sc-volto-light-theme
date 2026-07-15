import type { ConfigType } from '@plone/registry';
import { runtimeConfig } from '@plone/volto/runtime_config';
import { readStoredComponents } from './helpers/storage';
import Showcase from './components/Showcase/Showcase';

// runtime_config is plain JS and infers as `{}`, so the env shape is declared here.
const env = runtimeConfig as Record<string, string | undefined>;

// Applies the visitor's stored picks over the defaults the theme installed.
// Client only: the server has no localStorage, and its config is a single
// boot-time instance shared by every request, so a per-visitor override there
// would bleed across them.
function applyStoredComponents(config: ConfigType) {
  const components = config.settings.vlt?.components;
  if (!components) return;

  for (const [slot, name] of Object.entries(readStoredComponents())) {
    // Only honour slots that already exist, so a hand-edited entry cannot
    // invent new ones.
    if (name && slot in components) {
      components[slot as keyof typeof components] = name;
    }
  }
}

function applyConfig(config: ConfigType) {
  // A demo tool. Client builds keep it out by not listing this add-on in their
  // volto.config.js; the builds that do include it still gate at runtime on
  // RAZZLE_VLT_SHOWCASE. runtimeConfig reads process.env on the server and the
  // window.env the server serialises into the page on the client, so both
  // agree without a rebuild.
  if (!env.RAZZLE_VLT_SHOWCASE) {
    return config;
  }

  applyStoredComponents(config);

  config.settings.appExtras = [
    ...config.settings.appExtras,
    {
      match: '',
      component: Showcase,
      props: {},
    },
  ];

  return config;
}

export default applyConfig;
