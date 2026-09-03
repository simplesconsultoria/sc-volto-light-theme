import type { ConfigType } from '@plone/registry';
import { defineMessages } from 'react-intl';
import installSettings from './config/settings';
import installBlocks from './config/blocks';
import installComponents from './config/components';
import installSlots from './config/slots';
import installReducers from './config/reducers';
import installRoutes from './config/routes';

/**
 * Block and variation titles are plain strings in the block configuration, and
 * Volto translates them with `formatMessageWithFallback`, which uses the string
 * itself as the message id. They are declared here so `pnpm i18n` extracts them
 * into the catalogue — nothing reads this object at runtime.
 */
defineMessages({
  // Block titles
  byline: { id: 'Byline', defaultMessage: 'Byline' },
  mainImage: { id: 'Main Image', defaultMessage: 'Main Image' },
  heroBlock: { id: 'Hero Block', defaultMessage: 'Hero Block' },
  quote: { id: 'Quote', defaultMessage: 'Quote' },
  // Hero block variations
  heroFlex: { id: 'Flex / Decorative', defaultMessage: 'Flex / Decorative' },
  heroCard: { id: 'Attached Card', defaultMessage: 'Attached Card' },
  // Listing variations
  carousel: { id: 'Carousel', defaultMessage: 'Carousel' },
  mediaCarousel: { id: 'Media Carousel', defaultMessage: 'Media Carousel' },
  highlight: { id: 'Highlight', defaultMessage: 'Highlight' },
  // Block theme labels (see `createThemeDefinition` in config/blocks.ts)
  themePrimary: { id: 'Primary', defaultMessage: 'Primary' },
  themeBrand: { id: 'Brand', defaultMessage: 'Brand' },
});

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
