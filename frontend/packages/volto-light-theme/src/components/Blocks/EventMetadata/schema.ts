import { defineMessages } from 'react-intl';
import config from '@plone/volto/registry';

const messages = defineMessages({
  eventMetadata: {
    id: 'Event Metadata',
    defaultMessage: 'Event Metadata',
  },
  blockWidth: {
    id: 'Block Width',
    defaultMessage: 'Block Width',
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
      fields: [
        'location',
        'eventUrl',
        'eventUrlLabel',
        'contactName',
        'contactEmail',
        'price',
      ],
    },
    {
      id: 'styling',
      title: 'Styling',
      fields: ['blockWidth', 'theme'],
    },
  ],
  properties: {
    location: {
      title: 'Location (override)',
      type: 'string',
    },
    eventUrl: {
      title: 'Event URL (override)',
      widget: 'url',
    },
    eventUrlLabel: {
      title: 'Event URL Label (override)',
      type: 'string',
    },
    contactName: {
      title: 'Contact Name (override)',
      type: 'string',
    },
    contactEmail: {
      title: 'Contact Email (override)',
      type: 'string',
    },
    price: {
      title: 'Price/Participation (override)',
      type: 'string',
    },
    blockWidth: {
      title: intl.formatMessage(messages.blockWidth),
      widget: 'blockWidth',
      default: 'layout',
    },
    theme: {
      title: intl.formatMessage(messages.theme),
      widget: 'color_picker',
      themes: config.blocks.themes,
      default: 'slate',
    },
  },
  required: [],
});
