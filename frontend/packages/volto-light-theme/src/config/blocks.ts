import type { ConfigType } from '@plone/registry';
import type { BlockConfigBase } from '@plone/types';

import DocumentByLineInfo from '../components/Blocks/DocumentByLine';
import MainImageBlockInfo from '../components/Blocks/MainImageBlock';
import HeroBlockInfo from '../components/Blocks/HeroBlock';
import QuoteBlockInfo from '../components/Blocks/QuoteBlock';
import CarouselTemplate from '../components/Blocks/Listing/CarouselTemplate';
import MediaCarouselTemplate from '../components/Blocks/Listing/MediaCarouselTemplate';
import GridTemplate from '../components/Blocks/Listing/GridTemplate';
import {
  carouselSchemaEnhancer,
  mediaCarouselSchemaEnhancer,
  listingSchemaEnhancer,
} from '../components/Blocks/Listing/schema';
import { defaultContentTypeColors } from './contentTypeColors';

declare module '@plone/types' {
  export interface BlocksConfigData {
    documentByline: BlockConfigBase;
    mainImageBlock: BlockConfigBase;
    quoteBlock: BlockConfigBase;
    heroBlock: BlockConfigBase;
  }
}

// =============================================================================
// Theme Definition Factory
// =============================================================================
//
// Each theme maps semantic `--theme-*` CSS custom properties to concrete
// `--block-theme-{name}-*` tokens defined in `_root.scss`.
//
// The structure follows a two-layer model:
//
//   Ground          — the block's own background & text.
//   High Ground     — elevated elements within the block (cards, chips, etc.).
//   Border          — optional border style & width.
//   Pattern         — optional decorative background pattern / image.
//
// By using a factory, adding a new theme in a downstream project is a
// one-liner:  `createThemeDefinition('purple', 'Roxo')`

export interface ThemeDefinition {
  style: Record<string, string>;
  name: string;
  label: string;
}

/**
 * Create a complete theme definition by mapping every `--theme-*` variable
 * to its `--block-theme-{name}-*` counterpart.
 *
 * @param name  — Machine name used as the CSS token root (e.g. `"default"`, `"brand"`).
 * @param label — Human-readable label shown in the editor color picker.
 */
export function createThemeDefinition(
  name: string,
  label: string,
): ThemeDefinition {
  const v = (suffix: string) => `var(--block-theme-${name}-${suffix})`;
  return {
    style: {
      // Ground
      '--theme-color': v('bg'),
      '--theme-foreground-color': v('text'),
      '--theme-high-contrast-foreground-color': v('high-contrast'),
      '--theme-low-contrast-foreground-color': v('low-contrast'),
      '--theme-foreground-accent-color': v('accent-color'),
      // High Ground
      '--theme-high-contrast-color': v('high-bg'),
      '--theme-top-foreground-color': v('top-text'),
      '--theme-top-high-contrast-foreground-color': v('top-high-contrast'),
      '--theme-top-low-contrast-foreground-color': v('top-low-contrast'),
      '--theme-top-accent-color': v('top-accent-color'),
      // Border
      '--theme-border-color': v('border'),
      '--theme-border-width': v('border-width'),
      // Pattern (optional — defaults to none/0 in _root.scss)
      '--theme-pattern-image': v('pattern-image'),
      '--theme-pattern-opacity': v('pattern-opacity'),
    },
    name,
    label,
  };
}

const customThemes: ThemeDefinition[] = [
  createThemeDefinition('default', 'Primary'),
  createThemeDefinition('brand', 'Brand'),
];

// =============================================================================
// Installers
// =============================================================================

function installLocalBlocks(config: ConfigType) {
  config.blocks.blocksConfig.documentByline = DocumentByLineInfo;
  config.blocks.blocksConfig.mainImageBlock = MainImageBlockInfo;
  config.blocks.blocksConfig.heroBlock = HeroBlockInfo;
  config.blocks.blocksConfig.quoteBlock = QuoteBlockInfo;
  return config;
}

function installThemes(config: ConfigType) {
  config.blocks.themes = customThemes;
  return config;
}

function installGridBlock(config: ConfigType) {
  // Allow local blocks inside gridBlock and ensure it uses our custom themes.
  if ((config.blocks.blocksConfig as any).gridBlock) {
    (config.blocks.blocksConfig as any).gridBlock.themes = customThemes;
    (config.blocks.blocksConfig as any).gridBlock.blocksConfig = {
      ...(config.blocks.blocksConfig as any).gridBlock.blocksConfig,
      themes: customThemes,
    };

    const localBlocks = [
      'documentByline',
      '__button',
      'listing',
      'slider',
      'carousel',
      'mainImageBlock',
      'heroBlock',
      'quoteBlock',
    ];
    const gridBlock = (config.blocks.blocksConfig as any).gridBlock;
    if (gridBlock.allowedBlocks && gridBlock.blocksConfig) {
      gridBlock.allowedBlocks = [...gridBlock.allowedBlocks, ...localBlocks];
      localBlocks.forEach((blockId) => {
        gridBlock.blocksConfig[blockId] = (config.blocks.blocksConfig as any)[
          blockId
        ];
      });
    }
  }
  return config;
}

function installContentTypeColors(config: ConfigType) {
  (config.settings as any).contentTypeColors = {
    ...defaultContentTypeColors,
    ...((config.settings as any).contentTypeColors ?? {}),
  };
  return config;
}

export default function install(config: ConfigType) {
  installLocalBlocks(config);
  installThemes(config);
  installGridBlock(config);
  installContentTypeColors(config);

  // Listing: add a media carousel variation and override GridTemplate
  if ((config.blocks.blocksConfig as any).listing?.variations) {
    let variations = (config.blocks.blocksConfig as any).listing.variations;

    // Override 'grid' variation
    const gridIndex = variations.findIndex((v: any) => v.id === 'grid');
    if (gridIndex > -1) {
      variations[gridIndex].template = GridTemplate;
    }

    // Override 'imageGallery' variation (often the default name for grid)
    const galleryIndex = variations.findIndex(
      (v: any) => v.id === 'imageGallery',
    );
    if (galleryIndex > -1) {
      variations[galleryIndex].template = GridTemplate;
    }

    const hasCarousel = variations.some((v: any) => v.id === 'carousel');
    if (!hasCarousel) {
      variations = [
        ...variations,
        {
          id: 'carousel',
          title: 'Carrossel',
          template: CarouselTemplate,
          schemaEnhancer: carouselSchemaEnhancer,
        },
      ];
    }
    const hasMediaCarousel = variations.some(
      (v: any) => v.id === 'mediaCarousel',
    );
    if (!hasMediaCarousel) {
      variations = [
        ...variations,
        {
          id: 'mediaCarousel',
          title: 'Carrossel de Mídia',
          template: MediaCarouselTemplate,
          schemaEnhancer: mediaCarouselSchemaEnhancer,
        },
      ];
    }
    (config.blocks.blocksConfig as any).listing.variations = variations;
    const prevEnhancer = (config.blocks.blocksConfig as any).listing
      .schemaEnhancer;
    (config.blocks.blocksConfig as any).listing.schemaEnhancer = (
      args: any,
    ) => {
      const schema = prevEnhancer ? prevEnhancer(args) : args.schema;
      return listingSchemaEnhancer({ ...args, schema });
    };
  }

  return config;
}
