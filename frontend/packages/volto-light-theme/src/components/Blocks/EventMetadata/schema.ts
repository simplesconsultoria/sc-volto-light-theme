import { defineMessages } from 'react-intl';

const messages = defineMessages({
  eventMetadata: {
    id: 'Event Metadata',
    defaultMessage: 'Event Metadata',
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
      fields: ['theme'],
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
    theme: {
      widget: 'block_theme_widget',
      title: intl.formatMessage(messages.theme),
      default: 'default',
    },
  },
  required: [],
});
