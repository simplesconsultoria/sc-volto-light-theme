import type { ConfigType } from '@plone/registry';
import { defineMessages } from 'react-intl';
import installSettings from './config/settings';
import installBlocks from './config/blocks';
import installComponents from './config/components';
import installSlots from './config/slots';
import installReducers from './config/reducers';
import installRoutes from './config/routes';

import SimpleColorPickerWidget from './components/Widgets/SimpleColorPickerWidget';
import ColorGroupsWidget from './components/Widgets/ColorGroupsWidget';
import BlockThemesWidget from './components/Widgets/BlockThemesWidget';
import BlockThemeWidget from './components/Widgets/BlockThemeWidget';

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

  config.widgets.widget.style_simple_color = SimpleColorPickerWidget;
  config.widgets.widget.color_groups_widget = ColorGroupsWidget;
  config.widgets.widget.block_themes_widget = BlockThemesWidget;
  config.widgets.widget.block_theme_widget = BlockThemeWidget;

  // Ensure blocks with theme, backColorGroup, or frontColorGroup receive appropriate classes
  config.settings.styleClassNameExtenders = [
    ...(config.settings.styleClassNameExtenders || []),
    ({ data, classNames }: { data: any; classNames: Array<string> }) => {
      const rawTheme = data?.theme || data?.styles?.theme;
      const theme =
        typeof rawTheme === 'object' && rawTheme !== null
          ? rawTheme.theme
          : rawTheme;

      let customBack: string | undefined;
      let customFront: string | undefined;
      if (typeof theme === 'string' && theme.startsWith('custom-')) {
        const parts = theme.split('-');
        customBack = parts[1];
        customFront = parts[2];
      }

      const backColorGroup =
        data?.backColorGroup ||
        data?.styles?.backColorGroup ||
        customBack ||
        (typeof rawTheme === 'object' && rawTheme !== null
          ? rawTheme.backColorGroup
          : undefined);
      const frontColorGroup =
        data?.frontColorGroup ||
        data?.styles?.frontColorGroup ||
        customFront ||
        (typeof rawTheme === 'object' && rawTheme !== null
          ? rawTheme.frontColorGroup
          : undefined);

      // Clean existing theme/colorgroup classes to prevent duplicates
      const cleaned = classNames.filter(
        (cls) =>
          !cls.startsWith('has--theme--') &&
          !cls.startsWith('has-back-colorgroup-') &&
          !cls.startsWith('has-front-colorgroup-'),
      );

      if (theme) {
        cleaned.push(`has--theme--${theme}`);
        if (typeof theme === 'string' && theme.startsWith('custom-')) {
          cleaned.push('has--theme--custom');
        }
      }
      if (backColorGroup) {
        cleaned.push(`has-back-colorgroup-${backColorGroup}`);
      }
      if (frontColorGroup) {
        cleaned.push(`has-front-colorgroup-${frontColorGroup}`);
      }
      return cleaned;
    },
  ];

  return config;
}

export default applyConfig;
