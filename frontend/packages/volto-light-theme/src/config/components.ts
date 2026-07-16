import type { ConfigType } from '@plone/registry';

// Header
import SCHeader from '../components/Header/SCHeader';

// Navigation
import SCNavigation from '../components/Navigation/SCNavigation/SCNavigation';

function registerComponents(config: ConfigType) {
  // Header
  config.registerUtility({
    name: 'sc',
    type: 'header',
    method: SCHeader,
  });

  // Navigation
  config.registerUtility({
    name: 'sc',
    type: 'navigation',
    method: SCNavigation,
  });
}

export default function install(config: ConfigType) {
  // Register Components
  registerComponents(config);
}
