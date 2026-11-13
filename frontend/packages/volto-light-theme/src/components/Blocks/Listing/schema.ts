import { defineMessages } from 'react-intl';
import type { IntlShape } from '@plone/types/src/i18n';

const messages = defineMessages({
  carousel: {
    id: 'Carousel',
    defaultMessage: 'Carousel',
  },
  carouselMaxHeight: {
    id: 'Height (px)',
    defaultMessage: 'Height (px)',
  },
  carouselObjectFit: {
    id: 'Media fit (object-fit)',
    defaultMessage: 'Media fit (object-fit)',
  },
  carouselObjectPosition: {
    id: 'Position (object-position)',
    defaultMessage: 'Position (object-position)',
  },
  carouselAutoPlay: {
    id: 'Auto-advance',
    defaultMessage: 'Auto-advance',
  },
  carouselAutoPlayInterval: {
    id: 'Auto-advance interval (ms)',
    defaultMessage: 'Auto-advance interval (ms)',
  },
  headlineButtonText: {
    id: 'Headline button text',
    defaultMessage: 'Headline button text',
  },
  headlineButtonLink: {
    id: 'Headline button link',
    defaultMessage: 'Headline button link',
  },
  gridColumns: {
    id: 'Number of columns',
    defaultMessage: 'Number of columns',
  },
  columnCount: {
    id: '{count, plural, one {# column} other {# columns}}',
    defaultMessage: '{count, plural, one {# column} other {# columns}}',
  },
  align: {
    id: 'Alignment',
    defaultMessage: 'Alignment',
  },
  positionLeftTop: { id: 'Left top', defaultMessage: 'Left top' },
  positionCenterTop: { id: 'Center top', defaultMessage: 'Center top' },
  positionRightTop: { id: 'Right top', defaultMessage: 'Right top' },
  positionLeftCenter: { id: 'Left center', defaultMessage: 'Left center' },
  positionCenter: { id: 'Center', defaultMessage: 'Center' },
  positionRightCenter: { id: 'Right center', defaultMessage: 'Right center' },
  positionLeftBottom: { id: 'Left bottom', defaultMessage: 'Left bottom' },
  positionCenterBottom: {
    id: 'Center bottom',
    defaultMessage: 'Center bottom',
  },
  positionRightBottom: { id: 'Right bottom', defaultMessage: 'Right bottom' },
});

const objectPositionChoices = (intl: IntlShape) => [
  ['left top', intl.formatMessage(messages.positionLeftTop)],
  ['center top', intl.formatMessage(messages.positionCenterTop)],
  ['right top', intl.formatMessage(messages.positionRightTop)],
  ['left center', intl.formatMessage(messages.positionLeftCenter)],
  ['center center', intl.formatMessage(messages.positionCenter)],
  ['right center', intl.formatMessage(messages.positionRightCenter)],
  ['left bottom', intl.formatMessage(messages.positionLeftBottom)],
  ['center bottom', intl.formatMessage(messages.positionCenterBottom)],
  ['right bottom', intl.formatMessage(messages.positionRightBottom)],
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
      choices: objectPositionChoices(intl),
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
      title: intl.formatMessage(messages.carousel),
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
      choices: objectPositionChoices(intl),
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
      title: intl.formatMessage(messages.carousel),
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
      choices: [1, 2, 3, 4].map((count) => [
        count,
        intl.formatMessage(messages.columnCount, { count }),
      ]),
      default: 2,
    },
  };

  const fieldsets = schema.fieldsets || [];

  // Add to the default fieldset
  const defaultFieldset = fieldsets.find((f) => f.id === 'default');
  if (defaultFieldset) {
    if (!defaultFieldset.fields.includes('headlineButtonText')) {
      defaultFieldset.fields.push('headlineButtonText', 'headlineButtonLink');
    }
  }

  // `imageGallery` is the internal id Volto Light Theme uses for its grid
  // variation, so both ids get the column control.
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

export const teaserSchemaEnhancer = ({ schema, formData, intl }) => {
  if (formData?.variation !== 'teaser') return schema;

  const properties = {
    ...schema.properties,
    align: {
      widget: 'align',
      title: intl.formatMessage(messages.align),
      actions: ['left', 'right', 'center'],
      default: 'left',
    },
  };

  // Prefer the styling fieldset when the schema already has one.
  const hasStyles = schema.fieldsets?.some((f) => f.id === 'styling');

  if (!hasStyles) {
    const defaultFieldset = schema.fieldsets.find((f) => f.id === 'default');
    if (defaultFieldset && !defaultFieldset.fields.includes('align')) {
      defaultFieldset.fields.push('align');
    }
  }

  // We ensure styles schema has it if it's nested (Volto 16+ uses addStyling)
  if (schema.properties?.styles?.schema) {
    schema.properties.styles.schema.properties.align = {
      widget: 'align',
      title: intl.formatMessage(messages.align),
      actions: ['left', 'right', 'center'],
      default: 'left',
    };
    const stylesDefault = schema.properties.styles.schema.fieldsets.find(
      (f) => f.id === 'default',
    );
    if (stylesDefault && !stylesDefault.fields.includes('align')) {
      stylesDefault.fields.push('align');
    }
  }

  return {
    ...schema,
    properties,
  };
};
