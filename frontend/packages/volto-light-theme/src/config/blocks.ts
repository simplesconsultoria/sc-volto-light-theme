import React from 'react';
import { createThemeDefinition, type ThemeDefinition } from './blockThemes';
import type { ConfigType } from '@plone/registry';
import type { BlockConfigBase } from '@plone/types';
import { addStyling } from '@plone/volto/helpers/Extensions/withBlockSchemaEnhancer';
import calendarSVG from '@plone/volto/icons/calendar.svg';
import appsSVG from '@plone/volto/icons/apps.svg';
import cx from 'classnames';

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
import { SeparatorSchema } from '../components/Blocks/Separator/schema';
import {
  carouselSchemaEnhancer,
  mediaCarouselSchemaEnhancer,
  listingSchemaEnhancer,
  teaserSchemaEnhancer,
} from '../components/Blocks/Listing/schema';
import SearchBlockView from '../components/Blocks/Search/SearchBlockView';
import SearchBlockEdit from '../components/Blocks/Search/SearchBlockEdit';
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

const baseColorGroups = ['primary', 'secondary', 'accent', 'neutral'];
export function createCustomThemeDefinition(
  back: string,
  front: string,
): ThemeDefinition {
  const name = `custom-${back}-${front}`;
  const label = `Custom (${back} / ${front})`;
  return {
    name,
    label,
    style: {
      '--theme-color': `var(--colorgroup-${back}-bg, var(--${back}-color, var(--primary-color)))`,
      '--theme-foreground-color': `var(--colorgroup-${back}-text, var(--${back}-foreground-color, var(--primary-foreground-color)))`,
      '--theme-high-contrast-foreground-color': `var(--colorgroup-${back}-text, var(--${back}-foreground-color, var(--primary-foreground-color)))`,
      '--theme-low-contrast-foreground-color': `var(--colorgroup-${back}-subtext, var(--${back}-low-foreground-color, var(--primary-low-foreground-color)))`,
      '--theme-foreground-accent-color': `var(--colorgroup-${back}-accent, var(--${back}-accent-color, var(--primary-accent-color)))`,
      '--colorgroup-back-font': `var(--colorgroup-${back}-font-family, inherit)`,

      '--theme-high-contrast-color': `var(--colorgroup-${front}-bg, var(--${front}-color, var(--neutral-color)))`,
      '--theme-top-foreground-color': `var(--colorgroup-${front}-text, var(--${front}-foreground-color, var(--neutral-foreground-color)))`,
      '--theme-top-high-contrast-foreground-color': `var(--colorgroup-${front}-text, var(--${front}-foreground-color, var(--neutral-foreground-color)))`,
      '--theme-top-low-contrast-foreground-color': `var(--colorgroup-${front}-subtext, var(--${front}-low-foreground-color, var(--neutral-low-foreground-color)))`,
      '--theme-top-accent-color': `var(--colorgroup-${front}-accent, var(--${front}-accent-color, var(--neutral-accent-color)))`,
      '--colorgroup-front-font': `var(--colorgroup-${front}-font-family, inherit)`,
      '--theme-border-color': `var(--colorgroup-${back}-accent, var(--accent-color))`,
      '--theme-border-width': '0',
      '--theme-pattern-image': 'none',
      '--theme-pattern-opacity': '0',
    },
  };
}

const generatedCustomThemes: ThemeDefinition[] = [];
for (const back of baseColorGroups) {
  for (const front of baseColorGroups) {
    generatedCustomThemes.push(createCustomThemeDefinition(back, front));
  }
}

const customThemes: ThemeDefinition[] = [
  createThemeDefinition('default', 'Primary'),
  createThemeDefinition('alternative', 'Alternative'),
  createThemeDefinition('brand', 'Brand'),
  ...generatedCustomThemes,
];

const originalThemesFind = customThemes.find.bind(customThemes);
customThemes.find = function (predicate: any, thisArg?: any) {
  const result = originalThemesFind(predicate, thisArg);
  if (result) return result;
  for (const b of baseColorGroups) {
    for (const f of baseColorGroups) {
      const candidate = createCustomThemeDefinition(b, f);
      if (predicate.call(thisArg, candidate)) {
        return candidate;
      }
    }
  }
  return undefined;
};

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
    icon: appsSVG,
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
    icon: calendarSVG,
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
    config.blocks.blocksConfig.separator.schema = SeparatorSchema;
    config.blocks.blocksConfig.separator.blockSchema = SeparatorSchema;

    config.blocks.blocksConfig.separator.schemaEnhancer = (args: any) => {
      addStyling({ schema: args.schema, intl: args.intl });
      return args.schema;
    };
  }

  if (config.blocks.blocksConfig.introduction) {
    const prevEnhancer = config.blocks.blocksConfig.introduction.schemaEnhancer;
    config.blocks.blocksConfig.introduction.schemaEnhancer = (args: any) => {
      let schema = prevEnhancer ? prevEnhancer(args) : args.schema;
      addStyling({ schema, intl: args.intl });

      // Inject align in styling
      if (schema?.properties?.styles?.schema) {
        const stylesSchema = schema.properties.styles.schema;
        if (!stylesSchema.properties.align) {
          stylesSchema.properties.align = {
            widget: 'align',
            title: args.intl.formatMessage({
              id: 'Alignment',
              defaultMessage: 'Alignment',
            }),
          };
          const defaultFieldset = stylesSchema.fieldsets.find(
            (f: any) => f.id === 'default',
          );
          if (defaultFieldset && !defaultFieldset.fields.includes('align')) {
            defaultFieldset.fields.push('align');
          }
        }
      }
      return schema;
    };
  }

  // Garante que o bloco Slate padrão repasse className (com has--block-width--) e style na visualização
  if (config.blocks.blocksConfig.slate) {
    const PrevSlateView = config.blocks.blocksConfig.slate.view;
    config.blocks.blocksConfig.slate.view = (props: any) => {
      return React.createElement(
        'div',
        { className: cx('block slate', props.className), style: props.style },
        React.createElement(PrevSlateView, props),
      );
    };
  }

  // Garante que o bloco Table of Contents (toc) repasse className e style na visualização
  if (config.blocks.blocksConfig.toc) {
    const PrevTocView = config.blocks.blocksConfig.toc.view;
    config.blocks.blocksConfig.toc.view = (props: any) => {
      return React.createElement(
        'div',
        { className: cx('block toc', props.className), style: props.style },
        React.createElement(PrevTocView, props),
      );
    };
  }

  // Garante que o bloco SlateTable / Table repasse className e style na visualização
  if (config.blocks.blocksConfig.slateTable) {
    const PrevSlateTableView = config.blocks.blocksConfig.slateTable.view;
    config.blocks.blocksConfig.slateTable.view = (props: any) => {
      return React.createElement(
        'div',
        {
          className: cx(
            'block slateTable slate-table-wrapper',
            props.className,
          ),
          style: props.style,
        },
        React.createElement(PrevSlateTableView, props),
      );
    };
  }

  // Substitui view e edit do Search Block pelas versões aprimoradas com sistema de temas,
  // bordas personalizadas, controle de largura do bloco e sanitização contra variação inválida
  if (config.blocks.blocksConfig.search) {
    const PrevSearchView = SearchBlockView;
    const PrevSearchEdit = SearchBlockEdit;

    const sanitizeSearchData = (data: any) => {
      if (!data) return data;
      const variations =
        (config.blocks.blocksConfig as any).search?.variations || [];
      const validVariationIds = variations.map((v: any) => v.id);
      const defaultVariationId =
        variations.find((v: any) => v.id === 'facetsTopSide')?.id ||
        variations.find((v: any) => v.isDefault)?.id ||
        variations[0]?.id ||
        'facetsTopSide';

      const variation = data.variation;
      const isInvalid = !variation || !validVariationIds.includes(variation);
      if (!isInvalid) return data;

      return {
        ...data,
        listingBodyTemplate:
          data.listingBodyTemplate ||
          (validVariationIds.includes(variation) ? undefined : variation) ||
          'grid',
        variation: defaultVariationId,
      };
    };

    config.blocks.blocksConfig.search.view = (props: any) => {
      const safeData = sanitizeSearchData(props.data);
      const searchVariations =
        (config.blocks.blocksConfig as any).search?.variations || [];
      const validVariation = props.variation?.view
        ? props.variation
        : searchVariations.find((v: any) => v.id === safeData?.variation) ||
          searchVariations.find((v: any) => v.id === 'facetsTopSide') ||
          searchVariations.find((v: any) => v.isDefault) ||
          searchVariations[0];
      return React.createElement(PrevSearchView, {
        ...props,
        variation: validVariation,
        data: safeData,
      });
    };

    config.blocks.blocksConfig.search.edit = (props: any) => {
      const safeData = sanitizeSearchData(props.data);
      const searchVariations =
        (config.blocks.blocksConfig as any).search?.variations || [];
      const validVariation = props.variation?.view
        ? props.variation
        : searchVariations.find((v: any) => v.id === safeData?.variation) ||
          searchVariations.find((v: any) => v.id === 'facetsTopSide') ||
          searchVariations.find((v: any) => v.isDefault) ||
          searchVariations[0];
      return React.createElement(PrevSearchEdit, {
        ...props,
        variation: validVariation,
        data: safeData,
      });
    };
  }

  syncContainerBlocks(config);
  return config;
}

function installThemes(config: ConfigType) {
  config.blocks.themes = customThemes;
  return config;
}

function installGridBlock(config: ConfigType) {
  // Allow all blocks inside gridBlock and ensure it uses our custom themes.
  const gridBlock = (config.blocks.blocksConfig as any).gridBlock;
  if (gridBlock) {
    gridBlock.themes = customThemes;
    gridBlock.blocksConfig = {
      ...(gridBlock.blocksConfig || {}),
      themes: customThemes,
    };

    const currentAllowed = gridBlock.allowedBlocks || [
      'image',
      'listing',
      'slate',
      'teaser',
    ];

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

    const allBlockIds = Object.keys(config.blocks.blocksConfig).filter(
      (id) => id !== 'gridBlock',
    );

    gridBlock.allowedBlocks = Array.from(
      new Set([...currentAllowed, ...localBlocks, ...allBlockIds]),
    );

    allBlockIds.forEach((blockId) => {
      gridBlock.blocksConfig[blockId] = (config.blocks.blocksConfig as any)[
        blockId
      ];
    });

    const prevGridEnhancer = gridBlock.schemaEnhancer;
    gridBlock.schemaEnhancer = (args: any) => {
      const schema = prevGridEnhancer ? prevGridEnhancer(args) : args.schema;
      addStyling({ schema, intl: args.intl });
      return schema;
    };
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

/**
 * Remove os campos de tema (theme, backgroundColor) do schema e de styles.schema,
 * impedindo que blocos dentro de containers restritos (como o accordion) alterem seu tema.
 */
export const disableThemeSchema = ({ schema }: { schema: any }) => {
  if (!schema) return schema;

  if (schema.properties) {
    delete schema.properties.theme;
    delete schema.properties.backgroundColor;
  }
  if (schema.fieldsets) {
    schema.fieldsets.forEach((f: any) => {
      if (f.fields) {
        f.fields = f.fields.filter(
          (field: string) => field !== 'theme' && field !== 'backgroundColor',
        );
      }
    });
  }

  if (schema.properties?.styles?.schema) {
    const stylesSchema = schema.properties.styles.schema;
    if (stylesSchema.properties) {
      delete stylesSchema.properties.theme;
      delete stylesSchema.properties.backgroundColor;
    }
    if (stylesSchema.fieldsets) {
      stylesSchema.fieldsets.forEach((f: any) => {
        if (f.fields) {
          f.fields = f.fields.filter(
            (field: string) => field !== 'theme' && field !== 'backgroundColor',
          );
        }
      });
    }
  }

  return schema;
};

export function installAccordionBlock(config: ConfigType) {
  const accordion = (config.blocks.blocksConfig as any).accordion;
  if (!accordion) return config;

  if (!accordion.blocksConfig) {
    accordion.blocksConfig = {};
  }

  const currentAllowed = accordion.allowedBlocks || [
    'slate',
    'teaser',
    'image',
    'listing',
    'slateTable',
    'separator',
  ];

  const additionalBlocks = [
    '__button',
    'button',
    'documentByline',
    'byline',
    'eventCalendar',
    'eventsearch',
  ];

  const allBlockIds = Object.keys(config.blocks.blocksConfig).filter(
    (id) => id !== 'accordion',
  );

  accordion.allowedBlocks = Array.from(
    new Set([...currentAllowed, ...additionalBlocks, ...allBlockIds]),
  );

  return config;
}

export const DEFAULT_BORDER_EXCLUDED_BLOCKS = ['separator'];

/**
 * Aprimora a configuração de schema de um bloco para injetar:
 * 1. Tema do Bloco (widget unificado block_theme_widget)
 * 2. Largura do Bloco (blockWidth:noprefix) em todos os blocos
 * 3. Bordas (--cardBorderColor e --cardBorderWidth com border_widget) em todos os blocos,
 *    exceto aqueles listados em config.settings.borderExcludedBlocks
 */
export function enhanceBlockConfig(
  blockConfig: any,
  blockId: string,
  config: ConfigType,
) {
  if (!blockConfig || blockConfig.__vlt_styling_enhanced) return;
  blockConfig.__vlt_styling_enhanced = true;

  const prevEnhancer = blockConfig.schemaEnhancer;
  blockConfig.schemaEnhancer = (args: any) => {
    let schema = prevEnhancer ? prevEnhancer(args) : args.schema;

    // Garante que o fieldset 'styling' e schema.properties.styles.schema existam
    addStyling({ schema, intl: args.intl });

    // Garante que o widget unificado de Tema do Bloco esteja presente na raiz de estilo
    schema.properties = schema.properties || {};
    schema.properties.theme = {
      widget: 'block_theme_widget',
      title: args.intl.formatMessage({
        id: 'Block Theme',
        defaultMessage: 'Tema do Bloco',
      }),
      default: 'default',
    };

    // Remove campos redundantes legados
    // Remove campos redundantes legados e blockWidth nativo da raiz
    delete schema.properties.backgroundColor;
    delete schema.properties.blockWidth;
    if (schema.fieldsets) {
      // Remove blockWidth de qualquer fieldset padrão ou layout (mantido apenas em styles)
      schema.fieldsets.forEach((f: any) => {
        if (f.fields) {
          f.fields = f.fields.filter(
            (field: string) =>
              field !== 'backgroundColor' && field !== 'blockWidth',
          );
        }
      });

      const stylingFieldset = schema.fieldsets.find(
        (f: any) => f.id === 'styling',
      );
      if (stylingFieldset) {
        stylingFieldset.fields = [
          ...stylingFieldset.fields.filter(
            (f: string) =>
              f !== 'backgroundColor' &&
              f !== 'theme' &&
              f !== 'styles' &&
              f !== 'blockWidth',
          ),
          'theme',
          'styles',
        ];
      }
    }

    // Injeta opções no schema interno de estilos do Volto (styles.schema)
    if (schema?.properties?.styles?.schema) {
      const stylesSchema = schema.properties.styles.schema;
      stylesSchema.properties = stylesSchema.properties || {};

      // Remove propriedades redundantes de dentro de styles
      delete stylesSchema.properties.theme;
      delete stylesSchema.properties.backgroundColor;

      // 1. Largura do Bloco (universal para TODOS os blocos)
      // Para blocos de imagem (image e mainImageBlock), quando em modo de alinhamento lateral (left/right),
      // a opção de largura é desativada, pois o bloco flui naturalmente ao lado de outros elementos
      const isImageBlock = blockId === 'image' || blockId === 'mainImageBlock';
      const isAligned =
        isImageBlock &&
        Boolean(
          args?.formData?.align === 'left' ||
            args?.formData?.align === 'right' ||
            args?.formData?.styles?.['align:noprefix'] === 'left' ||
            args?.formData?.styles?.['align:noprefix'] === 'right' ||
            args?.formData?.styles?.align === 'left' ||
            args?.formData?.styles?.align === 'right' ||
            args?.data?.align === 'left' ||
            args?.data?.align === 'right' ||
            args?.data?.styles?.['align:noprefix'] === 'left' ||
            args?.data?.styles?.['align:noprefix'] === 'right' ||
            args?.data?.styles?.align === 'left' ||
            args?.data?.styles?.align === 'right',
        );

      if (!isAligned) {
        stylesSchema.properties['blockWidth:noprefix'] = {
          widget: 'blockWidth',
          title: args.intl.formatMessage({
            id: 'Block Width',
            defaultMessage: 'Largura do Bloco',
          }),
          default: 'default',
          actions: config.blocks?.widths?.map((w: any) => w.name || w) || [
            'narrow',
            'default',
            'layout',
            'full',
          ],
        };
      } else {
        delete stylesSchema.properties['blockWidth:noprefix'];
      }

      // 2. Bordas (para todos os blocos, EXCETO os excluídos da blacklist)
      const excluded =
        (config.settings as any)?.borderExcludedBlocks ||
        DEFAULT_BORDER_EXCLUDED_BLOCKS;
      const hasBorders = !excluded.includes(blockId);

      if (hasBorders) {
        stylesSchema.properties['--cardBorderColor'] = {
          widget: 'style_simple_color',
          title: args.intl.formatMessage({
            id: 'Border color',
            defaultMessage: 'Cor da Borda',
          }),
          default: '',
        };

        stylesSchema.properties['--cardBorderWidth'] = {
          widget: 'border_widget',
          title: args.intl.formatMessage({
            id: 'Border style and thickness',
            defaultMessage: 'Estilo e Espessura da Borda',
          }),
          description: args.intl.formatMessage({
            id: 'Configure border sides and thickness',
            defaultMessage: 'Selecione os lados e a espessura da borda',
          }),
          default: '',
        };
      }

      // Organiza a ordem dos campos no fieldset default do stylesSchema
      const defaultFieldset = stylesSchema.fieldsets?.find(
        (f: any) => f.id === 'default',
      );
      if (defaultFieldset) {
        defaultFieldset.fields = defaultFieldset.fields.filter(
          (f: string) =>
            f !== 'theme' &&
            f !== 'backgroundColor' &&
            f !== 'blockWidth:noprefix' &&
            f !== '--cardBorderColor' &&
            f !== '--cardBorderWidth',
        );

        if (!isAligned) {
          defaultFieldset.fields.push('blockWidth:noprefix');
        }
        if (hasBorders) {
          defaultFieldset.fields.push('--cardBorderColor');
          defaultFieldset.fields.push('--cardBorderWidth');
        }
      }
    }

    return schema;
  };
}

function syncContainerBlocks(config: ConfigType) {
  const containers = [
    'accordion',
    'tabs_block',
    'columnsBlock',
    'gridBlock',
    'customGrid',
  ];
  const allBlockIds = Object.keys(config.blocks.blocksConfig);

  containers.forEach((containerId) => {
    const container = (config.blocks.blocksConfig as any)[containerId];
    if (container) {
      if (!container.blocksConfig) {
        container.blocksConfig = {};
      }

      const allowedIds = allBlockIds.filter((id) => id !== containerId);
      if (Array.isArray(container.allowedBlocks)) {
        container.allowedBlocks = Array.from(
          new Set([...container.allowedBlocks, ...allowedIds]),
        );
      }

      allBlockIds.forEach((blockId) => {
        if (
          blockId !== containerId &&
          (config.blocks.blocksConfig as any)[blockId]
        ) {
          const globalBlockConfig = (config.blocks.blocksConfig as any)[
            blockId
          ];
          if (containerId === 'accordion') {
            const prevEnhancer = globalBlockConfig.schemaEnhancer;
            container.blocksConfig[blockId] = {
              ...globalBlockConfig,
              schemaEnhancer: (args: any) => {
                const schema = prevEnhancer ? prevEnhancer(args) : args.schema;
                return disableThemeSchema({ ...args, schema });
              },
            };
          } else {
            container.blocksConfig[blockId] = globalBlockConfig;
          }
        }
      });
    }
  });
  return config;
}

function installBlockStyling(config: ConfigType) {
  // Aplica em todos os blocos já existentes no registry
  Object.keys(config.blocks.blocksConfig).forEach((blockId) => {
    enhanceBlockConfig(config.blocks.blocksConfig[blockId], blockId, config);
  });

  // Proxy no blocksConfig para interceptar e aprimorar qualquer bloco futuro
  config.blocks.blocksConfig = new Proxy(config.blocks.blocksConfig, {
    set(target: any, prop: string, value: any) {
      if (value && typeof value === 'object') {
        enhanceBlockConfig(value, prop, config);
      }
      target[prop] = value;
      syncContainerBlocks(config);
      return true;
    },
  });

  syncContainerBlocks(config);
  return config;
}

export default function install(config: ConfigType) {
  installLocalBlocks(config);
  installThemes(config);
  installGridBlock(config);
  installAccordionBlock(config);
  installContentTypeColors(config);
  installBlockStyling(config);

  // Sync containers AFTER we modified the global listing/quote block variations

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

  syncContainerBlocks(config);

  return config;
}
