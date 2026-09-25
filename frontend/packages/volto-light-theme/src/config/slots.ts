import type { ConfigType } from '@plone/registry';

import PostFooter from '../components/Footer/PostFooter';
import Colophon from '../components/Footer/slots/Colophon';

function footerSlots(config: ConfigType) {
  config.registerSlotComponent({
    slot: 'postFooter',
    name: 'PostFooterFollowUsLogoAndLinks',
    component: PostFooter,
  });

  config.registerSlotComponent({
    name: 'Colophon',
    slot: 'postFooter',
    component: Colophon,
  });
}

// The theme's <style> element is contributed by `components/Theming`, which
// replaces the upstream component of the same name through a customization —
// upstream already registers it in the `aboveHeader` slot, so registering it
// again here would emit the rule twice.

export default function install(config: ConfigType) {
  footerSlots(config);
}
