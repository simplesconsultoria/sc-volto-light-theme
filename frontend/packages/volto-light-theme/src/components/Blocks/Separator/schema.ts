import { defineMessages } from 'react-intl';

const messages = defineMessages({
  separator: {
    id: 'Separator',
    defaultMessage: 'Separator',
  },
  color: {
    id: 'Color',
    defaultMessage: 'Color',
  },
  thickness: {
    id: 'Thickness (px)',
    defaultMessage: 'Thickness (px)',
  },
  width: {
    id: 'Line Width',
    defaultMessage: 'Line Width',
  },
  alignment: {
    id: 'Line Alignment',
    defaultMessage: 'Line Alignment',
  },
});

export const SeparatorSchema = ({ intl }: any) => ({
  title: intl?.formatMessage
    ? intl.formatMessage(messages.separator)
    : 'Separator',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['color', 'thickness', 'width', 'alignment'],
    },
  ],
  properties: {
    color: {
      title: intl?.formatMessage ? intl.formatMessage(messages.color) : 'Color',
      widget: 'style_simple_color',
    },
    thickness: {
      title: intl?.formatMessage
        ? intl.formatMessage(messages.thickness)
        : 'Thickness (px)',
      type: 'number',
      default: 1,
      minimum: 1,
      maximum: 20,
    },
    width: {
      title: intl?.formatMessage
        ? intl.formatMessage(messages.width)
        : 'Line Width',
      type: 'string',
      default: '100%',
      choices: [
        ['100%', '100%'],
        ['75%', '75%'],
        ['50%', '50%'],
        ['25%', '25%'],
      ],
    },
    alignment: {
      title: intl?.formatMessage
        ? intl.formatMessage(messages.alignment)
        : 'Line Alignment',
      widget: 'align',
      actions: ['left', 'center', 'right'],
      default: 'center',
    },
  },
  required: [],
});
