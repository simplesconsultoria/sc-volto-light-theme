import { defineMessages } from 'react-intl';
import config from '@plone/volto/registry';
const messages = defineMessages({
  labelCustomGrid: {
    id: 'Custom Grid',
    defaultMessage: 'Custom Grid',
  },
  labelTitle: {
    id: 'Title',
    defaultMessage: 'Title',
  },
  labelLayout: {
    id: 'Layout',
    defaultMessage: 'Layout',
  },
  labelColumn: {
    id: 'Column',
    defaultMessage: 'Column',
  },
  labelTheme: {
    id: 'Theme',
    defaultMessage: 'Theme',
  },
  labelDefault: {
    id: 'Default',
    defaultMessage: 'Default',
  },
  labelPrimary: {
    id: 'Primary',
    defaultMessage: 'Primary',
  },
  labelSecondary: {
    id: 'Secondary',
    defaultMessage: 'Secondary',
  },
  labelTertiary: {
    id: 'Tertiary',
    defaultMessage: 'Tertiary',
  },
  labelGrey: {
    id: 'Grey',
    defaultMessage: 'Grey',
  },
});

export const ColumnSchema = (intl: any) => {
  return {
    title: intl.formatMessage(messages.labelColumn),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.labelDefault),
        fields: ['theme'],
      },
    ],
    properties: {
      theme: {
        widget: 'color_picker',
        title: intl.formatMessage(messages.labelTheme),
        themes: config.blocks?.themes || [],
        default: config.blocks?.themes?.[0]?.name || '',
      },
    },
    required: [],
  };
};

export const CustomGridSchema = ({ intl }: { intl: any }) => ({
  title: intl.formatMessage(messages.labelCustomGrid),
  fieldsets: [
    {
      id: 'default',
      title: intl.formatMessage(messages.labelDefault),
      fields: ['title', 'layout', 'blockWidth'],
    },
  ],
  properties: {
    title: {
      title: intl.formatMessage(messages.labelTitle),
      type: 'string',
    },
    layout: {
      title: intl.formatMessage(messages.labelLayout),
      choices: [
        ['1', '100%'],
        ['1-1', '50 / 50'],
        ['1-4', '20 / 80'],
        ['4-1', '80 / 20'],
        ['1-2', '33 / 66'],
        ['2-1', '66 / 33'],
        ['2-3', '40 / 60'],
        ['3-2', '60 / 40'],
        ['1-1-1', '33 / 33 / 33'],
        ['2-1-1', '50 / 25 / 25'],
        ['1-2-1', '25 / 50 / 25'],
        ['1-1-2', '25 / 25 / 50'],
        ['1-1-1-1', '25 / 25 / 25 / 25'],
      ],
      default: '1-1',
    },
    blockWidth: {
      title: 'Block Width',
      widget: 'blockWidth',
      default: 'layout',
    },
  },
  required: ['layout'],
});
