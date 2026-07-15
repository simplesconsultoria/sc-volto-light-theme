import type { ConfigType } from '@plone/registry';
import AccessibilityBar from '../components/AccessibilityBar/AccessibilityBar';

import PostFooter from '../components/Footer/PostFooter';

function headerSlots(config: ConfigType) {
  config.registerSlotComponent({
    slot: 'headerTop',
    name: 'AccessibilityBar',
    component: AccessibilityBar,
  });
}

function footerSlots(config: ConfigType) {
  config.registerSlotComponent({
    slot: 'postFooter',
    name: 'PostFooterFollowUsLogoAndLinks',
    component: PostFooter,
  });
}

export default function install(config: ConfigType) {
  // Register Slots
  headerSlots(config);
  footerSlots(config);
}
