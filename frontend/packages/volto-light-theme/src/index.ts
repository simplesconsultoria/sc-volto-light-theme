import type { ConfigType } from '@plone/registry';
import installSettings from './config/settings';
import installBlocks from './config/blocks';
import installComponents from './config/components';
import installSlots from './config/slots';
import installReducers from './config/reducers';
import installRoutes from './config/routes';

function applyConfig(config: ConfigType) {
  installSettings(config);
  installBlocks(config);
  installComponents(config);
  installSlots(config);
  installReducers(config);
  installRoutes(config);

  return config;
}

export default applyConfig;
