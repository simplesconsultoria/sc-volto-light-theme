import { describe, it, expect } from 'vitest';
import install, {
  enhanceBlockConfig,
  DEFAULT_BORDER_EXCLUDED_BLOCKS,
  disableThemeSchema,
  installAccordionBlock,
} from './blocks';

describe('Block Width and Borders Schema Enhancer', () => {
  it('injeta theme, blockWidth e borders no schema de blocos padrão', () => {
    const mockBlockConfig: any = {
      id: 'testBlock',
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
    };

    const mockConfig: any = {
      blocks: {
        widths: [
          { name: 'narrow' },
          { name: 'default' },
          { name: 'layout' },
          { name: 'full' },
        ],
        blocksConfig: {
          testBlock: mockBlockConfig,
        },
      },
      settings: {
        borderExcludedBlocks: DEFAULT_BORDER_EXCLUDED_BLOCKS,
      },
    };

    enhanceBlockConfig(mockBlockConfig, 'testBlock', mockConfig);

    expect(mockBlockConfig.schemaEnhancer).toBeDefined();

    const enhancedSchema = mockBlockConfig.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });

    // Tema do bloco
    expect(enhancedSchema.properties.theme).toBeDefined();
    expect(enhancedSchema.properties.theme.widget).toBe('block_theme_widget');

    // Styling schema
    expect(enhancedSchema.properties.styles).toBeDefined();
    const stylesSchema = enhancedSchema.properties.styles.schema;
    expect(stylesSchema).toBeDefined();

    // Block Width
    expect(stylesSchema.properties['blockWidth:noprefix']).toBeDefined();
    expect(stylesSchema.properties['blockWidth:noprefix'].widget).toBe(
      'blockWidth',
    );

    // Borders
    expect(stylesSchema.properties['--cardBorderColor']).toBeDefined();
    expect(stylesSchema.properties['--cardBorderColor'].widget).toBe(
      'style_simple_color',
    );
    expect(stylesSchema.properties['--cardBorderWidth']).toBeDefined();
    expect(stylesSchema.properties['--cardBorderWidth'].widget).toBe(
      'border_widget',
    );
  });

  it('respeita borderExcludedBlocks e não injeta bordas para o bloco separator', () => {
    const mockSeparatorConfig: any = {
      id: 'separator',
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
    };

    const mockConfig: any = {
      blocks: {
        widths: [],
        blocksConfig: {
          separator: mockSeparatorConfig,
        },
      },
      settings: {
        borderExcludedBlocks: ['separator'],
      },
    };

    enhanceBlockConfig(mockSeparatorConfig, 'separator', mockConfig);

    const enhancedSchema = mockSeparatorConfig.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });

    const stylesSchema = enhancedSchema.properties.styles.schema;
    // Largura deve existir
    expect(stylesSchema.properties['blockWidth:noprefix']).toBeDefined();
    // Bordas não devem existir
    expect(stylesSchema.properties['--cardBorderColor']).toBeUndefined();
    expect(stylesSchema.properties['--cardBorderWidth']).toBeUndefined();
  });

  it('intercepta blocos futuros adicionados via Proxy no blocksConfig', () => {
    const mockConfig: any = {
      blocks: {
        themes: [],
        widths: [],
        blocksConfig: {},
      },
      settings: {},
    };

    install(mockConfig);

    // Adiciona um bloco futuro dinamicamente
    const futureBlock: any = {
      id: 'futureBlock',
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
    };

    mockConfig.blocks.blocksConfig.futureBlock = futureBlock;

    expect(futureBlock.schemaEnhancer).toBeDefined();

    const enhancedSchema = futureBlock.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });

    const stylesSchema = enhancedSchema.properties.styles.schema;
    expect(stylesSchema.properties['blockWidth:noprefix']).toBeDefined();
    expect(stylesSchema.properties['--cardBorderWidth']).toBeDefined();
    expect(stylesSchema.properties['--cardBorderWidth'].widget).toBe(
      'border_widget',
    );
  });

  it('remove blockWidth nativo da raiz e dos fieldsets para evitar campos duplicados', () => {
    const mockBlockConfig: any = {
      id: 'legacyWidthBlock',
      schema: {
        fieldsets: [
          {
            id: 'default',
            title: 'Default',
            fields: ['title', 'blockWidth'],
          },
          {
            id: 'layout',
            title: 'Layout',
            fields: ['layout', 'blockWidth'],
          },
        ],
        properties: {
          title: { type: 'string' },
          layout: { type: 'string' },
          blockWidth: {
            widget: 'blockWidth',
            title: 'Block Width Native',
          },
        },
      },
    };

    const mockConfig: any = {
      blocks: {
        widths: ['narrow', 'default', 'layout', 'full'],
        blocksConfig: {
          legacyWidthBlock: mockBlockConfig,
        },
      },
      settings: {},
    };

    enhanceBlockConfig(mockBlockConfig, 'legacyWidthBlock', mockConfig);

    const enhancedSchema = mockBlockConfig.schemaEnhancer({
      schema: {
        fieldsets: [
          {
            id: 'default',
            title: 'Default',
            fields: ['title', 'blockWidth'],
          },
          {
            id: 'layout',
            title: 'Layout',
            fields: ['layout', 'blockWidth'],
          },
        ],
        properties: {
          title: { type: 'string' },
          layout: { type: 'string' },
          blockWidth: {
            widget: 'blockWidth',
            title: 'Block Width Native',
          },
        },
      },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });

    // Deve ter removido blockWidth da raiz de properties
    expect(enhancedSchema.properties.blockWidth).toBeUndefined();

    // Deve ter removido blockWidth de todos os fieldsets da raiz
    enhancedSchema.fieldsets.forEach((fieldset: any) => {
      expect(fieldset.fields).not.toContain('blockWidth');
    });

    // Deve manter apenas dentro de styles.schema
    const stylesSchema = enhancedSchema.properties.styles.schema;
    expect(stylesSchema.properties['blockWidth:noprefix']).toBeDefined();
  });

  it('desativa blockWidth no schema quando image ou mainImageBlock estiver com alinhamento lateral', () => {
    const mockImageConfig: any = {
      id: 'image',
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
    };

    const mockConfig: any = {
      blocks: {
        widths: ['narrow', 'default', 'layout', 'full'],
        blocksConfig: {
          image: mockImageConfig,
        },
      },
      settings: {},
    };

    enhanceBlockConfig(mockImageConfig, 'image', mockConfig);

    // Quando align for 'left', blockWidth deve ser desativado
    const enhancedLeft = mockImageConfig.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      formData: { align: 'left' },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });
    expect(
      enhancedLeft.properties.styles.schema.properties['blockWidth:noprefix'],
    ).toBeUndefined();
    expect(
      enhancedLeft.properties.styles.schema.fieldsets[0].fields,
    ).not.toContain('blockWidth:noprefix');

    // Quando align for 'center', blockWidth deve estar presente
    const enhancedCenter = mockImageConfig.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      formData: { align: 'center' },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });
    expect(
      enhancedCenter.properties.styles.schema.properties['blockWidth:noprefix'],
    ).toBeDefined();
    expect(
      enhancedCenter.properties.styles.schema.fieldsets[0].fields,
    ).toContain('blockWidth:noprefix');
  });

  it('envolve as views de slate, toc e slateTable para repassar className e style na visualização', () => {
    const mockConfig: any = {
      blocks: {
        blocksConfig: {
          slate: {
            view: () => 'SlateContent',
          },
          toc: {
            view: () => 'TocContent',
          },
          slateTable: {
            view: () => 'TableContent',
          },
        },
      },
      settings: {},
    };

    install(mockConfig);

    const SlateView = mockConfig.blocks.blocksConfig.slate.view;
    const slateEl = SlateView({
      className: 'has--block-width--layout',
      style: { color: 'blue' },
    });
    expect(slateEl.props.className).toContain('block slate');
    expect(slateEl.props.className).toContain('has--block-width--layout');
    expect(slateEl.props.style).toEqual({ color: 'blue' });

    const TocView = mockConfig.blocks.blocksConfig.toc.view;
    const tocEl = TocView({
      className: 'has--block-width--narrow',
      style: { color: 'green' },
    });
    expect(tocEl.props.className).toContain('block toc');
    expect(tocEl.props.className).toContain('has--block-width--narrow');

    const TableView = mockConfig.blocks.blocksConfig.slateTable.view;
    const tableEl = TableView({
      className: 'has--block-width--full',
      style: { color: 'red' },
    });
    expect(tableEl.props.className).toContain('block slateTable');
    expect(tableEl.props.className).toContain('has--block-width--full');
  });

  it('disableThemeSchema remove theme e backgroundColor dos schemas raiz e styles', () => {
    const inputSchema = {
      fieldsets: [
        {
          id: 'default',
          title: 'Default',
          fields: ['title', 'theme', 'backgroundColor'],
        },
        { id: 'styling', title: 'Styling', fields: ['theme', 'styles'] },
      ],
      properties: {
        title: { type: 'string' },
        theme: { widget: 'block_theme_widget' },
        backgroundColor: { widget: 'color_picker' },
        styles: {
          schema: {
            fieldsets: [
              {
                id: 'default',
                fields: ['theme', 'backgroundColor', 'blockWidth:noprefix'],
              },
            ],
            properties: {
              theme: { widget: 'block_theme_widget' },
              backgroundColor: { widget: 'color_picker' },
              'blockWidth:noprefix': { widget: 'blockWidth' },
            },
          },
        },
      },
    };

    const cleaned = disableThemeSchema({ schema: inputSchema });

    // Raiz
    expect(cleaned.properties.theme).toBeUndefined();
    expect(cleaned.properties.backgroundColor).toBeUndefined();
    expect(cleaned.fieldsets[0].fields).not.toContain('theme');
    expect(cleaned.fieldsets[0].fields).not.toContain('backgroundColor');
    expect(cleaned.fieldsets[1].fields).not.toContain('theme');

    // styles.schema
    const stylesSchema = cleaned.properties.styles.schema;
    expect(stylesSchema.properties.theme).toBeUndefined();
    expect(stylesSchema.properties.backgroundColor).toBeUndefined();
    expect(stylesSchema.properties['blockWidth:noprefix']).toBeDefined();
    expect(stylesSchema.fieldsets[0].fields).not.toContain('theme');
    expect(stylesSchema.fieldsets[0].fields).not.toContain('backgroundColor');
    expect(stylesSchema.fieldsets[0].fields).toContain('blockWidth:noprefix');
  });

  it('installAccordionBlock adiciona __button, button, documentByline, byline, eventCalendar e eventsearch a allowedBlocks', () => {
    const mockConfig: any = {
      blocks: {
        blocksConfig: {
          accordion: {
            allowedBlocks: ['slate', 'image', 'listing'],
            blocksConfig: {},
          },
        },
      },
    };

    installAccordionBlock(mockConfig);

    const allowed = mockConfig.blocks.blocksConfig.accordion.allowedBlocks;
    expect(allowed).toContain('__button');
    expect(allowed).toContain('button');
    expect(allowed).toContain('documentByline');
    expect(allowed).toContain('byline');
    expect(allowed).toContain('eventCalendar');
    expect(allowed).toContain('eventsearch');
    expect(allowed).toContain('slate');
    expect(allowed).toContain('image');
    expect(allowed).toContain('listing');
  });

  it('elementos dentro de accordion.blocksConfig não permitem alterar tema mas accordion global mantém tema', () => {
    const mockConfig: any = {
      blocks: {
        widths: ['narrow', 'default', 'layout', 'full'],
        themes: [],
        blocksConfig: {
          accordion: {
            id: 'accordion',
            allowedBlocks: ['slate', 'teaser', 'image', 'listing'],
            blocksConfig: {},
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
          teaser: {
            id: 'teaser',
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
          documentByline: {
            id: 'documentByline',
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
          __button: {
            id: '__button',
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
        },
      },
      settings: {},
    };

    install(mockConfig);

    // 1. Accordion global deve ter tema configurável
    const globalAccordion = mockConfig.blocks.blocksConfig.accordion;
    const accordionSchema = globalAccordion.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });
    expect(accordionSchema.properties.theme).toBeDefined();

    // 2. Blocos globais devem ter tema configurável
    const globalTeaser = mockConfig.blocks.blocksConfig.teaser;
    const globalTeaserSchema = globalTeaser.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });
    expect(globalTeaserSchema.properties.theme).toBeDefined();

    // 3. Blocos dentro do accordion NÃO devem ter campo de tema no schema
    const innerTeaser = globalAccordion.blocksConfig.teaser;
    expect(innerTeaser).toBeDefined();
    const innerTeaserSchema = innerTeaser.schemaEnhancer({
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
      intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
    });
    expect(innerTeaserSchema.properties.theme).toBeUndefined();
    innerTeaserSchema.fieldsets.forEach((f: any) => {
      expect(f.fields).not.toContain('theme');
    });

    // 4. __button e documentByline devem estar em allowedBlocks e blocksConfig do accordion
    expect(globalAccordion.allowedBlocks).toContain('__button');
    expect(globalAccordion.allowedBlocks).toContain('documentByline');
    expect(globalAccordion.blocksConfig.__button).toBeDefined();
    expect(globalAccordion.blocksConfig.documentByline).toBeDefined();

    const innerButtonSchema =
      globalAccordion.blocksConfig.__button.schemaEnhancer({
        schema: {
          fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
          properties: {},
        },
        intl: { formatMessage: ({ defaultMessage }: any) => defaultMessage },
      });
    expect(innerButtonSchema.properties.theme).toBeUndefined();
  });

  it('permite que todos os blocos sejam adicionados em gridBlock e accordion (allowedBlocks e blocksConfig sincronizados)', () => {
    const mockConfig: any = {
      blocks: {
        widths: ['narrow', 'default', 'layout', 'full'],
        themes: [],
        blocksConfig: {
          accordion: {
            id: 'accordion',
            allowedBlocks: ['slate'],
            blocksConfig: {},
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
          gridBlock: {
            id: 'gridBlock',
            allowedBlocks: ['image'],
            blocksConfig: {},
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
          video: {
            id: 'video',
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
          heading: {
            id: 'heading',
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
          teaser: {
            id: 'teaser',
            schema: {
              fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
              properties: {},
            },
          },
        },
      },
      settings: {},
    };

    install(mockConfig);

    const accordion = mockConfig.blocks.blocksConfig.accordion;
    const gridBlock = mockConfig.blocks.blocksConfig.gridBlock;

    // 1. accordion deve permitir video, heading, teaser, gridBlock e customGrid
    expect(accordion.allowedBlocks).toContain('video');
    expect(accordion.allowedBlocks).toContain('heading');
    expect(accordion.allowedBlocks).toContain('teaser');
    expect(accordion.allowedBlocks).toContain('gridBlock');
    expect(accordion.allowedBlocks).toContain('customGrid');
    expect(accordion.allowedBlocks).not.toContain('accordion'); // não aninha em si mesmo

    // 2. gridBlock deve permitir video, heading, teaser, accordion e customGrid
    expect(gridBlock.allowedBlocks).toContain('video');
    expect(gridBlock.allowedBlocks).toContain('heading');
    expect(gridBlock.allowedBlocks).toContain('teaser');
    expect(gridBlock.allowedBlocks).toContain('accordion');
    expect(gridBlock.allowedBlocks).toContain('customGrid');
    expect(gridBlock.allowedBlocks).not.toContain('gridBlock'); // não aninha em si mesmo

    // 3. blocksConfig interno deve estar preenchido para ambos
    expect(accordion.blocksConfig.video).toBeDefined();
    expect(accordion.blocksConfig.heading).toBeDefined();
    expect(gridBlock.blocksConfig.video).toBeDefined();
    expect(gridBlock.blocksConfig.heading).toBeDefined();

    // 4. Novos blocos adicionados posteriormente via Proxy devem ser sincronizados
    mockConfig.blocks.blocksConfig.novoBloco = {
      id: 'novoBloco',
      schema: {
        fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
        properties: {},
      },
    };

    expect(accordion.allowedBlocks).toContain('novoBloco');
    expect(gridBlock.allowedBlocks).toContain('novoBloco');
    expect(accordion.blocksConfig.novoBloco).toBeDefined();
    expect(gridBlock.blocksConfig.novoBloco).toBeDefined();
  });

  it('sanitiza variação inválida no bloco Search para evitar TypeError de variation undefined', () => {
    const mockSearchView = () => null;
    const mockSearchEdit = () => null;

    const mockConfig: any = {
      blocks: {
        widths: [],
        blocksConfig: {
          search: {
            id: 'search',
            view: mockSearchView,
            edit: mockSearchEdit,
            variations: [
              { id: 'facetsRightSide', title: 'Right', isDefault: true },
              { id: 'facetsLeftSide', title: 'Left' },
              { id: 'facetsTopSide', title: 'Top' },
            ],
          },
        },
      },
      settings: {
        borderExcludedBlocks: [],
      },
    };

    install(mockConfig);

    // 1. Testa View com variação inválida ('grid')
    const testData = {
      '@type': 'search',
      variation: 'grid',
    };
    const viewResult: any = mockConfig.blocks.blocksConfig.search.view({
      data: testData,
    });

    expect(viewResult.props.data.variation).toBe('facetsTopSide');
    expect(viewResult.props.data.listingBodyTemplate).toBe('grid');

    // 2. Testa Edit com variação vazia/undefined
    const testDataEmpty = {
      '@type': 'search',
    };
    const editResult: any = mockConfig.blocks.blocksConfig.search.edit({
      data: testDataEmpty,
    });

    expect(editResult.props.data.variation).toBe('facetsTopSide');
    expect(editResult.props.data.listingBodyTemplate).toBe('grid');
  });
});
