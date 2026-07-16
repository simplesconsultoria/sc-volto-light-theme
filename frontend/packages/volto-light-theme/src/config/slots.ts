import type { ConfigType } from '@plone/registry';

import PostFooter from '../components/Footer/PostFooter';

function headerSlots(config: ConfigType) {}

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
