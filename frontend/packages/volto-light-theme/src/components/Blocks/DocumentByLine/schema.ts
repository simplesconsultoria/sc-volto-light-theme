import { defineMessages } from 'react-intl';
import type { BlockSchemaProps } from '@plone/types';

const messages = defineMessages({
  documentByline: {
    id: 'Byline',
    defaultMessage: 'Byline',
  },
  showPublished: {
    id: 'Show publication date',
    defaultMessage: 'Show publication date',
  },
  showModified: {
    id: 'Show last modification date',
    defaultMessage: 'Show last modification date',
  },
  showAuthor: {
    id: 'Show author',
    defaultMessage: 'Show author',
  },
});

export const DocumentByLineSchema = (props: BlockSchemaProps): any => {
  const { intl } = props;

  return {
    title: intl.formatMessage(messages.documentByline),
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

    required: [],
  };
};
