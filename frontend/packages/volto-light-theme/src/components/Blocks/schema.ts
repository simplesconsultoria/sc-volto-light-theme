import { addStyling } from '@plone/volto/helpers/Extensions/withBlockSchemaEnhancer';
import config from '@plone/volto/registry';
import { defineMessages } from 'react-intl';
import type { IntlShape } from '@plone/types/src/i18n';
import type { JSONSchema } from '@plone/types/src/config/';

const messages = defineMessages({
  backgroundColor: {
    id: 'Theme Preset',
    defaultMessage: 'Theme Preset',
  },
  borderColor: {
    id: 'Border color',
    defaultMessage: 'Border color',
  },
  backColorGroup: {
    id: 'Área de Trás (Color Group)',
    defaultMessage: 'Área de Trás (Color Group)',
  },
  frontColorGroup: {
    id: 'Área da Frente (Color Group)',
    defaultMessage: 'Área da Frente (Color Group)',
  },
  defaultFromTheme: {
    id: 'Padrão do Tema',
    defaultMessage: 'Padrão do Tema',
  },
});

interface StylingSchemaProps {
  schema: JSONSchema;
  formData: any;
  intl: IntlShape;
}

export const defaultStylingSchema = ({
  schema,
  formData,
  intl,
}: StylingSchemaProps): JSONSchema => {
  const blockConfig = config.blocks?.blocksConfig?.[formData['@type']];
  const themes = blockConfig?.themes || config.blocks.themes;
  const defaultTheme =
    blockConfig?.defaultTheme || config.blocks.themes?.[0]?.name;

  addStyling({ schema, intl });

  const stylingIndex = schema.fieldsets.findIndex(
    (item) => item.id === 'styling',
  );
  if (stylingIndex === -1 || !schema.fieldsets[stylingIndex]) return schema;

  schema.fieldsets[stylingIndex].fields = [
    ...schema.fieldsets[stylingIndex].fields.filter(
      (f) =>
        f !== 'backColorGroup' &&
        f !== 'frontColorGroup' &&
        f !== 'theme' &&
        f !== 'backgroundColor',
    ),
    'theme',
  ];

  delete schema.properties.backgroundColor;
  if (schema.properties?.styles?.schema) {
    delete schema.properties.styles.schema.properties.backgroundColor;
    delete schema.properties.styles.schema.properties.theme;
  }

  schema.properties = schema.properties || {};
  schema.properties.theme = {
    widget: 'block_theme_widget',
    title: 'Tema do Bloco',
    default: defaultTheme || 'default',
  };

  return schema;
};
