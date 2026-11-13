import type { ConfigType } from '@plone/registry';

import PostFooter from '../components/Footer/PostFooter';
import Colophon from '../components/Footer/slots/Colophon';
import Theming from '../components/Theming/Theming';

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

function themingSlot(config: ConfigType) {
  // Override upstream @kitconcept/volto-light-theme's Theming component cleanly via registry
  config.registerSlotComponent({
    slot: 'aboveHeader',
    name: 'Theming',
    component: Theming,
  });
}

export default function install(config: ConfigType) {
  footerSlots(config);
  themingSlot(config);
}
