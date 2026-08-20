import type { ConfigType } from '@plone/registry';

import PostFooter from '../components/Footer/PostFooter';

function footerSlots(config: ConfigType) {
  config.registerSlotComponent({
    slot: 'postFooter',
    name: 'PostFooterFollowUsLogoAndLinks',
    component: PostFooter,
  });
}

// The theme's <style> element is contributed by `components/Theming`, which
// replaces the upstream component of the same name through a customization —
// upstream already registers it in the `aboveHeader` slot, so registering it
// again here would emit the rule twice.

export default function install(config: ConfigType) {
  footerSlots(config);
}
