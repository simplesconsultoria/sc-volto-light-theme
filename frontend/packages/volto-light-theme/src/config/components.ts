import type { ConfigType } from '@plone/registry';
import PostFooter from '../components/Footer/PostFooter';

export default function install(config: ConfigType) {
  // Register Slots
  config.registerSlotComponent({
    slot: 'postFooter',
    name: 'PostFooterFollowUsLogoAndLinks',
    component: PostFooter,
  });
}
