import { defineMessages } from 'react-intl';

const messages = defineMessages({
  carouselMaxHeight: {
    id: 'Altura (px)',
    defaultMessage: 'Altura (px)',
  },
  carouselObjectFit: {
    id: 'Ajuste da mídia (object-fit)',
    defaultMessage: 'Ajuste da mídia (object-fit)',
  },
  carouselObjectPosition: {
    id: 'Posição (object-position)',
    defaultMessage: 'Posição (object-position)',
  },
  carouselAutoPlay: {
    id: 'Auto-avanço',
    defaultMessage: 'Auto-avanço',
  },
  carouselAutoPlayInterval: {
    id: 'Intervalo do auto-avanço (ms)',
    defaultMessage: 'Intervalo do auto-avanço (ms)',
  },
  headlineButtonText: {
    id: 'headlineButtonText',
    defaultMessage: 'Texto do Botão (Título)',
  },
  headlineButtonLink: {
    id: 'headlineButtonLink',
    defaultMessage: 'Link do Botão (Título)',
  },
  gridColumns: {
    id: 'gridColumns',
    defaultMessage: 'Número de Colunas (Grid)',
  },
});

const objectPositionChoices = [
  ['left top', 'Topo esquerdo'],
  ['center top', 'Topo centro'],
  ['right top', 'Topo direito'],
  ['left center', 'Centro esquerdo'],
  ['center center', 'Centro'],
  ['right center', 'Centro direito'],
  ['left bottom', 'Fundo esquerdo'],
  ['center bottom', 'Fundo centro'],
  ['right bottom', 'Fundo direito'],
];

export const carouselSchemaEnhancer = ({ schema, formData, intl }) => {
  if (formData?.variation !== 'carousel') return schema;

  const properties = {
    ...schema.properties,
    carouselMaxHeight: {
      title: intl.formatMessage(messages.carouselMaxHeight),
      type: 'number',
      default: 520,
      minimum: 200,
      maximum: 1200,
    },
    carouselObjectFit: {
      title: intl.formatMessage(messages.carouselObjectFit),
      type: 'string',
      default: 'contain',
      choices: [
        ['contain', 'contain'],
        ['cover', 'cover'],
      ],
    },
    carouselObjectPosition: {
      title: intl.formatMessage(messages.carouselObjectPosition),
      type: 'string',
      default: 'center center',
      choices: objectPositionChoices,
    },
    carouselAutoPlay: {
      title: intl.formatMessage(messages.carouselAutoPlay),
      type: 'boolean',
      default: false,
    },
    carouselAutoPlayInterval: {
      title: intl.formatMessage(messages.carouselAutoPlayInterval),
      type: 'number',
      default: 6000,
      minimum: 2000,
      maximum: 60000,
    },
  };

  const fieldsets = schema.fieldsets || [];
  const hasFieldset = fieldsets.some((f) => f.id === 'carousel');

  if (!hasFieldset) {
    fieldsets.push({
      id: 'carousel',
      title: 'Carrossel',
      fields: [
        'carouselMaxHeight',
        'carouselObjectFit',
        'carouselObjectPosition',
        'carouselAutoPlay',
        'carouselAutoPlayInterval',
      ],
    });
  } else {
    const idx = fieldsets.findIndex((f) => f.id === 'carousel');
    const existing = fieldsets[idx]?.fields || [];
    fieldsets[idx] = {
      ...fieldsets[idx],
      fields: Array.from(
        new Set([
          ...existing,
          'carouselMaxHeight',
          'carouselObjectFit',
          'carouselObjectPosition',
          'carouselAutoPlay',
          'carouselAutoPlayInterval',
        ]),
      ),
    };
  }

  return {
    ...schema,
    properties,
    fieldsets,
  };
};

export const mediaCarouselSchemaEnhancer = ({ schema, formData, intl }) => {
  if (formData?.variation !== 'mediaCarousel') return schema;

  const properties = {
    ...schema.properties,
    carouselMaxHeight: {
      title: intl.formatMessage(messages.carouselMaxHeight),
      type: 'number',
      default: 520,
      minimum: 200,
      maximum: 1200,
    },
    carouselObjectFit: {
      title: intl.formatMessage(messages.carouselObjectFit),
      type: 'string',
      default: 'contain',
      choices: [
        ['contain', 'contain'],
        ['cover', 'cover'],
      ],
    },
    carouselObjectPosition: {
      title: intl.formatMessage(messages.carouselObjectPosition),
      type: 'string',
      default: 'center center',
      choices: objectPositionChoices,
    },
    carouselAutoPlay: {
      title: intl.formatMessage(messages.carouselAutoPlay),
      type: 'boolean',
      default: false,
    },
    carouselAutoPlayInterval: {
      title: intl.formatMessage(messages.carouselAutoPlayInterval),
      type: 'number',
      default: 6000,
      minimum: 2000,
      maximum: 60000,
    },
  };

  const fieldsets = schema.fieldsets || [];
  const hasFieldset = fieldsets.some((f) => f.id === 'carousel');

  if (!hasFieldset) {
    fieldsets.push({
      id: 'carousel',
      title: 'Carrossel',
      fields: [
        'carouselMaxHeight',
        'carouselObjectFit',
        'carouselObjectPosition',
        'carouselAutoPlay',
        'carouselAutoPlayInterval',
      ],
    });
  } else {
    const idx = fieldsets.findIndex((f) => f.id === 'carousel');
    const existing = fieldsets[idx]?.fields || [];
    fieldsets[idx] = {
      ...fieldsets[idx],
      fields: Array.from(
        new Set([
          ...existing,
          'carouselMaxHeight',
          'carouselObjectFit',
          'carouselObjectPosition',
          'carouselAutoPlay',
          'carouselAutoPlayInterval',
        ]),
      ),
    };
  }

  return {
    ...schema,
    properties,
    fieldsets,
  };
};

export const listingSchemaEnhancer = ({ schema, formData, intl }) => {
  schema.properties = {
    ...schema.properties,
    headlineButtonText: {
      title: intl.formatMessage(messages.headlineButtonText),
      type: 'string',
    },
    headlineButtonLink: {
      title: intl.formatMessage(messages.headlineButtonLink),
      widget: 'object_browser',
      mode: 'link',
      allowExternals: true,
    },
    gridColumns: {
      title: intl.formatMessage(messages.gridColumns),
      type: 'number',
      choices: [
        [1, '1 Coluna'],
        [2, '2 Colunas'],
        [3, '3 Colunas'],
        [4, '4 Colunas'],
      ],
      default: 4,
    },
  };

  const fieldsets = schema.fieldsets || [];

  // Adiciona ao default fieldset
  const defaultFieldset = fieldsets.find((f) => f.id === 'default');
  if (defaultFieldset) {
    if (!defaultFieldset.fields.includes('headlineButtonText')) {
      defaultFieldset.fields.push('headlineButtonText', 'headlineButtonLink');
    }
  }

  // Se a variação for grid (imageGallery é o nome interno de grid no Volto Light Theme e padrão), adiciona o gridColumns
  // Vamos adicionar globalmente no 'default' e ignorar se não for usado, ou checar a variação:
  if (
    formData?.variation === 'imageGallery' ||
    formData?.variation === 'grid'
  ) {
    if (defaultFieldset && !defaultFieldset.fields.includes('gridColumns')) {
      defaultFieldset.fields.push('gridColumns');
    }
  }

  return schema;
};
