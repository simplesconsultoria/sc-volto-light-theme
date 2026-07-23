import type { ConfigType } from '@plone/registry';

import PostFooter from '../components/Footer/PostFooter';

function footerSlots(config: ConfigType) {
  config.registerSlotComponent({
    slot: 'postFooter',
    name: 'PostFooterFollowUsLogoAndLinks',
    component: PostFooter,
  });
}

export default function install(config: ConfigType) {
  footerSlots(config);
}
