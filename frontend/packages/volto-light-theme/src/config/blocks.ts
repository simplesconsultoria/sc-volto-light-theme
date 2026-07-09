import type { ConfigType } from '@plone/registry';
import type { BlockConfigBase } from '@plone/types';

import DocumentByLineInfo from '../components/Blocks/DocumentByLine';
import MainImageBlockInfo from '../components/Blocks/MainImageBlock';
import HeroBlockInfo from '../components/Blocks/HeroBlock';
import QuoteBlockInfo from '../components/Blocks/QuoteBlock';
import CarouselTemplate from '../components/Blocks/Listing/CarouselTemplate';
import MediaCarouselTemplate from '../components/Blocks/Listing/MediaCarouselTemplate';
import {
  carouselSchemaEnhancer,
  mediaCarouselSchemaEnhancer,
  listingSchemaEnhancer,
} from '../components/Blocks/Listing/schema';

declare module '@plone/types' {
  export interface BlocksConfigData {
    documentByline: BlockConfigBase;
    mainImageBlock: BlockConfigBase;
    quoteBlock: BlockConfigBase;
    heroBlock: BlockConfigBase;
  }
}

const customThemes = [
  {
    style: {
      '--theme-color': 'var(--block-theme-default-bg)',
      '--theme-foreground-color': 'var(--block-theme-default-text)',
      '--theme-high-contrast-foreground-color':
        'var(--block-theme-default-high-contrast)',
      '--theme-low-contrast-foreground-color':
        'var(--block-theme-default-low-contrast)',
      '--theme-foreground-accent-color':
        'var(--block-theme-default-accent-color)',

      '--theme-high-contrast-color': 'var(--block-theme-default-high-bg)',
      '--theme-top-foreground-color': 'var(--block-theme-default-top-text)',
      '--theme-top-high-contrast-foreground-color':
        'var(--block-theme-default-top-high-contrast)',
      '--theme-top-low-contrast-foreground-color':
        'var(--block-theme-default-top-low-contrast)',
      '--theme-top-accent-color': 'var(--block-theme-default-top-accent-color)',
      '--theme-border-color': 'var(--block-theme-default-border)',
      '--theme-border-width': 'var(--block-theme-default-border-width)',
    },
    name: 'default',
    label: 'Default',
  },
  {
    style: {
      '--theme-color': 'var(--block-theme-brand-bg)',
      '--theme-foreground-color': 'var(--block-theme-brand-text)',
      '--theme-high-contrast-foreground-color':
        'var(--block-theme-brand-high-contrast)',
      '--theme-low-contrast-foreground-color':
        'var(--block-theme-brand-low-contrast)',
      '--theme-foreground-accent-color': 'var(--block-theme-brand-accent-color)',

      '--theme-high-contrast-color': 'var(--block-theme-brand-high-bg)',
      '--theme-top-foreground-color': 'var(--block-theme-brand-top-text)',
      '--theme-top-high-contrast-foreground-color':
        'var(--block-theme-brand-top-high-contrast)',
      '--theme-top-low-contrast-foreground-color':
        'var(--block-theme-brand-top-low-contrast)',
      '--theme-top-accent-color': 'var(--block-theme-brand-top-accent-color)',
      '--theme-border-color': 'var(--block-theme-brand-border)',
      '--theme-border-width': 'var(--block-theme-brand-border-width)',
    },
    name: 'brand',
    label: 'Marca',
  },
];

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

export default function install(config: ConfigType) {
  installLocalBlocks(config);
  installThemes(config);
  installGridBlock(config);

  // Listing: add a media carousel variation
  if ((config.blocks.blocksConfig as any).listing?.variations) {
    let variations = (config.blocks.blocksConfig as any).listing.variations;
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
