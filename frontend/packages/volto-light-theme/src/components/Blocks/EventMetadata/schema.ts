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
  default: { id: 'Default', defaultMessage: 'Default' },
  styling: { id: 'Styling', defaultMessage: 'Styling' },
  location: {
    id: 'Location (override)',
    defaultMessage: 'Location (override)',
  },
  eventUrl: {
    id: 'Event URL (override)',
    defaultMessage: 'Event URL (override)',
  },
  eventUrlLabel: {
    id: 'Event URL Label (override)',
    defaultMessage: 'Event URL Label (override)',
  },
  contactName: {
    id: 'Contact Name (override)',
    defaultMessage: 'Contact Name (override)',
  },
  contactEmail: {
    id: 'Contact Email (override)',
    defaultMessage: 'Contact Email (override)',
  },
  price: {
    id: 'Price/Participation (override)',
    defaultMessage: 'Price/Participation (override)',
  },
});

export const EventMetadataSchema = ({ intl }: any) => ({
  title: intl.formatMessage(messages.eventMetadata),
  fieldsets: [
    {
      id: 'default',
      title: intl.formatMessage(messages.default),
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
      title: intl.formatMessage(messages.styling),
      fields: ['theme'],
    },
  ],
  properties: {
    location: {
      title: intl.formatMessage(messages.location),
      type: 'string',
    },
    eventUrl: {
      title: intl.formatMessage(messages.eventUrl),
      widget: 'url',
    },
    eventUrlLabel: {
      title: intl.formatMessage(messages.eventUrlLabel),
      type: 'string',
    },
    contactName: {
      title: intl.formatMessage(messages.contactName),
      type: 'string',
    },
    contactEmail: {
      title: intl.formatMessage(messages.contactEmail),
      type: 'string',
    },
    price: {
      title: intl.formatMessage(messages.price),
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
