import type { ConfigType } from '@plone/registry';
import themeSVG from '@plone/volto/icons/theme.svg';

import ThemesControlpanel from '../components/Controlpanels/Themes/Themes';

/**
 * Register the themes control panel.
 *
 * Volto's generic `/controlpanel/:id` route renders a single-schema registry
 * form, which cannot express a collection of themes. Addon routes are matched
 * *before* the default ones (see `routes.js` in `@plone/volto`), so this entry
 * takes over `/controlpanel/themes`.
 *
 * The route carries no authorization guard: the panel itself renders
 * `Unauthorized` when the API refuses the fetch, which is the only check that
 * can tell an editor without the permission from a manager with it.
 */
export default function installRoutes(config: ConfigType) {
  config.addonRoutes = [
    ...(config.addonRoutes ?? []),
    {
      path: '/controlpanel/themes',
      component: ThemesControlpanel,
    },
  ];

  config.settings.controlPanelsIcons = {
    ...config.settings.controlPanelsIcons,
    themes: themeSVG,
  };

  return config;
}
