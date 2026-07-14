import { defineMessages } from 'react-intl';
import type { BlockSchemaProps } from '@plone/types';

const messages = defineMessages({
  DocumentByLineBlock: {
    id: 'Previsão do Tempo',
    defaultMessage: 'Previsão do Tempo',
  },
  showPublished: {
    id: 'Exibir data de publicação?',
    defaultMessage: 'Exibir data de publicação?',
  },
  showModified: {
    id: 'Exibir última modificação?',
    defaultMessage: 'Exibir última modificação?',
  },
  showAuthor: {
    id: 'Exibir autor?',
    defaultMessage: 'Exibir autor?',
  },
});

export const DocumentByLineSchema = (props: BlockSchemaProps): any => {
  const { intl } = props;

  return {
    title: intl.formatMessage(messages.DocumentByLineBlock),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['showPublished', 'showModified', 'showAuthor'],
      },
    ],
    properties: {
      showPublished: {
        title: intl.formatMessage(messages.showPublished),
        type: 'boolean',
        default: true,
      },
      showModified: {
        title: intl.formatMessage(messages.showModified),
        type: 'boolean',
        default: true,
      },
      showAuthor: {
        title: intl.formatMessage(messages.showAuthor),
        type: 'boolean',
        default: false,
      },
    },

    required: ['showPublished', 'showModified', 'showAuthor'],
  };
};
