import type { ConfigType } from '@plone/registry';
// Header
import Header from '@kitconcept/volto-light-theme/components/Header/Header';
import SCHeader from '../components/Header/SCHeader';

// Navigation
import Navigation from '@kitconcept/volto-light-theme/components/Navigation/Navigation';
import SCNavigation from '../components/Navigation/SCNavigation/SCNavigation';

// Mobile Navigation
import MobileNavigation from '@kitconcept/volto-light-theme/components/MobileNavigation/MobileNavigation';

// Footer
import Footer from '@kitconcept/volto-light-theme/components/Footer/Footer';

function registerComponents(config: ConfigType) {
  // Header
  config.registerUtility({
    name: 'vlt',
    type: 'header',
    method: Header,
  });
  config.registerUtility({
    name: 'sc',
    type: 'header',
    method: SCHeader,
  });

  // Navigation
  config.registerUtility({
    name: 'vlt',
    type: 'navigation',
    method: Navigation,
  });
  config.registerUtility({
    name: 'sc',
    type: 'navigation',
    method: SCNavigation,
  });

  // Mobile Navigation
  config.registerUtility({
    name: 'vlt',
    type: 'mobileNavigation',
    method: MobileNavigation,
  });

  // Footer
  config.registerUtility({
    name: 'vlt',
    type: 'footer',
    method: Footer,
  });
}

export default function install(config: ConfigType) {
  // Register Components
  registerComponents(config);
}
