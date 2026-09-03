import { defineMessages } from 'react-intl';
import type { IntlShape } from '@plone/types/src/i18n';
import { defaultStylingSchema } from '../schema';

const messages = defineMessages({
  quoteBlock: {
    id: 'Quote',
    defaultMessage: 'Quote',
  },
  author: {
    id: 'Author / Source',
    defaultMessage: 'Author / Source',
  },
  backgroundStyle: {
    id: 'Background style',
    defaultMessage: 'Background style',
  },
  backgroundTransparent: {
    id: 'Transparent',
    defaultMessage: 'Transparent',
  },
  backgroundFilled: {
    id: 'Filled',
    defaultMessage: 'Filled',
  },
});

interface QuoteSchemaProps {
  intl: IntlShape;
  formData?: Record<string, any>;
  data?: Record<string, any>;
  [key: string]: any;
}

export function QuoteBlockSchema(props: QuoteSchemaProps): any {
  const { intl } = props;
  const formData = props.formData ?? props.data ?? {};

  const schema: any = {
    title: intl.formatMessage(messages.quoteBlock),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['author', 'backgroundStyle'],
      },
    ],
    properties: {
      author: {
        title: intl.formatMessage(messages.author),
        type: 'string',
      },
      backgroundStyle: {
        title: intl.formatMessage(messages.backgroundStyle),
        type: 'string',
        choices: [
          ['transparent', intl.formatMessage(messages.backgroundTransparent)],
          ['filled', intl.formatMessage(messages.backgroundFilled)],
        ],
        default: 'transparent',
      },
    },
    required: [],
  };

  // Apply the default styling schema (theme color picker)
  const enhancedSchema = defaultStylingSchema({ schema, formData, intl });

  return enhancedSchema;
}
