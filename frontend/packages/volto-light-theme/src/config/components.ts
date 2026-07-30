import type { ConfigType } from '@plone/registry';

// Header
import Header from '../components/Header/Header';

// Navigation
import SCNavigation from '../components/Navigation/SCNavigation/SCNavigation';

// Additional Components
import MobileHeader from '../components/Header/MobileHeader/MobileHeader';
import HeaderBar from '../components/HeaderBar/HeaderBar';
import DropdownMenu from '../components/DropdownMenu/DropdownMenu';

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

  // Additional Components
  config.components.MobileHeader = { component: MobileHeader };
  config.components.HeaderBar = { component: HeaderBar };
  config.components.DropdownMenu = { component: DropdownMenu };
  config.settings.scvlt.headerBar.quickLinks = [];
}

export default function install(config: ConfigType) {
  // Register Components
  registerComponents(config);
}
