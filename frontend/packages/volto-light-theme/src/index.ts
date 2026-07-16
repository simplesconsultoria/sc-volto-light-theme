import type { ConfigType } from '@plone/registry';
import installSettings from './config/settings';
import installBlocks from './config/blocks';
import installComponents from './config/components';
import installSlots from './config/slots';

function applyConfig(config: ConfigType) {
  installSettings(config);
  installBlocks(config);
  installComponents(config);
  installSlots(config);

  return config;
}

export default applyConfig;
