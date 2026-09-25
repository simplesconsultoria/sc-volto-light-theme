import { createThemeDefinition } from './blockThemes';
import type { ConfigType } from '@plone/registry';
import type { BlockConfigBase } from '@plone/types';
import { addStyling } from '@plone/volto/helpers/Extensions/withBlockSchemaEnhancer';

import DocumentByLineInfo from '../components/Blocks/DocumentByLine';
import MainImageBlockInfo from '../components/Blocks/MainImageBlock';
import HeroBlockInfo from '../components/Blocks/HeroBlock';
import QuoteBlockInfo from '../components/Blocks/QuoteBlock';
import { CustomGridSchema } from '../components/Blocks/CustomGrid/Schema';
import CustomGridView from '../components/Blocks/CustomGrid/View';
import CustomGridEdit from '../components/Blocks/CustomGrid/Edit';
import CarouselTemplate from '../components/Blocks/Listing/CarouselTemplate';
import MediaCarouselTemplate from '../components/Blocks/Listing/MediaCarouselTemplate';
import GridTemplate from '../components/Blocks/Listing/GridTemplate';
import TeaserTemplate from '../components/Blocks/Listing/TeaserTemplate';
import EventsTemplate from '../components/Blocks/Listing/EventsTemplate';
import {
  EventMetadataView,
  EventMetadataEdit,
} from '../components/Blocks/EventMetadata';
import { EventMetadataSchema } from '../components/Blocks/EventMetadata/schema';
import SeparatorView from '../components/Blocks/Separator/View';
import SeparatorEdit from '../components/Blocks/Separator/Edit';
import {
  carouselSchemaEnhancer,
  mediaCarouselSchemaEnhancer,
  listingSchemaEnhancer,
  teaserSchemaEnhancer,
} from '../components/Blocks/Listing/schema';
import { defaultContentTypeColors } from './contentTypeColors';

declare module '@plone/types' {
  export interface BlocksConfigData {
    documentByline: BlockConfigBase;
    mainImageBlock: BlockConfigBase;
    quoteBlock: BlockConfigBase;
    heroBlock: BlockConfigBase;
    customGrid: BlockConfigBase;
  }
}

// =============================================================================
// Theme Definition Factory
// =============================================================================
//
// Each theme maps semantic `--theme-*` CSS custom properties to concrete
// `--block-theme-{name}-*` tokens defined in `_root.scss`.
//
// The structure follows a four-layer model:
//
//   Ground          — the block's own background & text.
//   High Ground     — elevated elements within the block (cards, chips, etc.).
//   Border          — optional border style & width.
//   Pattern         — optional decorative background pattern / image.
//
// By using a factory, adding a new theme in a downstream project is a
// one-liner:  `createThemeDefinition('purple', 'Purple')`

export type { ThemeDefinition } from './blockThemes';
export { createThemeDefinition } from './blockThemes';

/**
 * `themes` and `defaultTheme` are a kitconcept convention that Volto's own
 * block config type does not declare, so reading them off `blocksConfig`
 * fails to typecheck without this augmentation. Same approach as the
 * `SettingsConfig` augmentation in `config/settings.ts`.
 */
declare module '@plone/types' {
  interface BlockConfigBase {
    themes?: ThemeDefinition[];
    defaultTheme?: string;
  }
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

  config.blocks.blocksConfig.customGrid = {
    id: 'customGrid',
    title: 'Custom Grid',
    icon: '', // can be added if needed
    group: 'common',
    view: CustomGridView,
    edit: CustomGridEdit,
    schema: CustomGridSchema,
    blockSchema: CustomGridSchema,
    blockHasOwnFocusManagement: true,
    restricted: false,
    mostUsed: true,
    sidebarTab: 1,
  };

  config.blocks.blocksConfig.eventMetadata = {
    id: 'eventMetadata',
    title: 'Event Metadata',
    icon: '',
    group: 'common',
    view: EventMetadataView,
    edit: EventMetadataEdit,
    schema: EventMetadataSchema,
    blockSchema: EventMetadataSchema,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
  };

  if (config.blocks.blocksConfig.separator) {
    config.blocks.blocksConfig.separator.view = SeparatorView;
    config.blocks.blocksConfig.separator.edit = SeparatorEdit;
  }

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

function injectCardBorderColor(config: ConfigType) {
  const blocksToEnhance = ['listing', 'teaser', 'slider', 'carousel'];

  blocksToEnhance.forEach((blockId) => {
    const applyToBlock = (blockConfig: any) => {
      if (!blockConfig) return;

      const prevEnhancer = blockConfig.schemaEnhancer;
      blockConfig.schemaEnhancer = (args: any) => {
        let schema = prevEnhancer ? prevEnhancer(args) : args.schema;

        // Force addStyling so that schema.properties.styles.schema is available
        addStyling({ schema, intl: args.intl });

        // Inject into Volto's internal styles schema
        if (schema?.properties?.styles?.schema) {
          const stylesSchema = schema.properties.styles.schema;

          stylesSchema.properties['--cardBorderColor'] = {
            widget: 'style_simple_color',
            title: args.intl.formatMessage({
              id: 'Border color',
              defaultMessage: 'Border color',
            }),
            default: '',
          };

          const defaultFieldset = stylesSchema.fieldsets.find(
            (f: any) => f.id === 'default',
          );
          if (
            defaultFieldset &&
            !defaultFieldset.fields.includes('--cardBorderColor')
          ) {
            defaultFieldset.fields.push('--cardBorderColor');
          }
        }

        return schema;
      };
    };

    // Apply to standard blocks
    applyToBlock((config.blocks.blocksConfig as any)[blockId]);

    // Apply to gridBlock inner blocks if gridBlock exists
    const gridBlock = (config.blocks.blocksConfig as any).gridBlock;
    if (
      gridBlock &&
      gridBlock.blocksConfig &&
      gridBlock.blocksConfig[blockId]
    ) {
      applyToBlock(gridBlock.blocksConfig[blockId]);
    }
  });
  return config;
}

export default function install(config: ConfigType) {
  installLocalBlocks(config);
  installThemes(config);
  installGridBlock(config);
  installContentTypeColors(config);
  injectCardBorderColor(config);

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
          title: 'Carousel',
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
          title: 'Media Carousel',
          template: MediaCarouselTemplate,
          schemaEnhancer: mediaCarouselSchemaEnhancer,
        },
      ];
    }
    const hasTeaser = variations.some((v: any) => v.id === 'teaser');
    if (!hasTeaser) {
      variations = [
        ...variations,
        {
          id: 'teaser',
          title: 'Highlight',
          template: TeaserTemplate,
          schemaEnhancer: teaserSchemaEnhancer,
        },
      ];
    }
    const hasEvents = variations.some((v: any) => v.id === 'events');
    if (!hasEvents) {
      variations = [
        ...variations,
        {
          id: 'events',
          title: 'Eventos',
          template: EventsTemplate,
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
