import type { ConfigType } from '@plone/registry';

// Header
import Header from '../components/Header/Header';

// Navigation
import SCNavigation from '../components/Navigation/SCNavigation/SCNavigation';

function registerComponents(config: ConfigType) {
  // Header
  config.registerUtility({
    name: 'sc',
    type: 'header',
    method: Header,
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
