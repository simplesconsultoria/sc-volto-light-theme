import type { ConfigType } from '@plone/registry';
import installSettings from './config/settings';
import installBlocks from './config/blocks';
import PostFooter from './components/Footer/PostFooter';

function applyConfig(config: ConfigType) {
  installSettings(config);
  installBlocks(config);

  config.registerSlotComponent({
    slot: 'postFooter',
    name: 'PostFooterFollowUsLogoAndLinks',
    component: PostFooter,
  });

  return config;
}

export default applyConfig;
