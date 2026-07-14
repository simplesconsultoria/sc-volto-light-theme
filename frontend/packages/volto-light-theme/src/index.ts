import type { ConfigType } from '@plone/registry';
import installSettings from './config/settings';
import installBlocks from './config/blocks';
import installComponents from './config/components';

function applyConfig(config: ConfigType) {
  installSettings(config);
  installBlocks(config);
  installComponents(config);

  return config;
}

export default applyConfig;
