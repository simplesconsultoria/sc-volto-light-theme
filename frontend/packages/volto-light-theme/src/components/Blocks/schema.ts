import { addStyling } from '@plone/volto/helpers/Extensions/withBlockSchemaEnhancer';
import config from '@plone/volto/registry';
import { defineMessages } from 'react-intl';
import type { IntlShape } from '@plone/types/src/i18n';
import type { JSONSchema } from '@plone/types/src/config/';

const messages = defineMessages({
  backgroundColor: {
    id: 'Background color',
    defaultMessage: 'Background color',
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
    ...schema.fieldsets[stylingIndex].fields,
    'theme',
  ];

  schema.properties = schema.properties || {};
  schema.properties.theme = {
    widget: 'color_picker',
    title: intl.formatMessage(messages.backgroundColor),
    themes: Array.isArray(themes) ? themes : [],
    default: defaultTheme,
  };

  return schema;
};
