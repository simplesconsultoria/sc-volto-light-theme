import { defineMessages } from 'react-intl';

const messages = defineMessages({
  eventMetadata: {
    id: 'Event Metadata',
    defaultMessage: 'Event Metadata',
  },
  blockWidth: {
    id: 'Block Width',
    defaultMessage: 'Block Width',
  },
  align: {
    id: 'Alignment',
    defaultMessage: 'Alignment',
  },
  theme: {
    id: 'Theme',
    defaultMessage: 'Theme',
  },
});

export const EventMetadataSchema = ({ intl }: any) => ({
  title: intl.formatMessage(messages.eventMetadata),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [],
    },
    {
      id: 'styling',
      title: 'Styling',
      fields: ['blockWidth', 'align', 'theme'],
    },
  ],
  properties: {
    blockWidth: {
      title: intl.formatMessage(messages.blockWidth),
      widget: 'blockWidth',
      default: 'layout',
    },
    align: {
      title: intl.formatMessage(messages.align),
      widget: 'align',
      default: 'left',
    },
    theme: {
      title: intl.formatMessage(messages.theme),
      widget: 'color_picker',
      default: 'slate',
    },
  },
  required: [],
});
