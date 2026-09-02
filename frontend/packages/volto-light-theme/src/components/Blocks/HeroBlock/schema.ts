import { defineMessages } from 'react-intl';
import type { IntlShape } from '@plone/types/src/i18n';
import { defaultStylingSchema } from '../schema';

const messages = defineMessages({
  heroBlock: {
    id: 'Hero Block',
    defaultMessage: 'Hero Block',
  },
  content: {
    id: 'Content',
    defaultMessage: 'Content',
  },
  overwrite: {
    id: 'Overwrite content',
    defaultMessage: 'Overwrite content',
  },
  overwriteDescription: {
    id: 'Overwrite content description',
    defaultMessage:
      'Check to customise the title, description and image instead of pulling them automatically from the highlighted item',
  },
  headerText: {
    id: 'Header text',
    defaultMessage: 'Header text',
  },
  headerTextDescription: {
    id: 'Header text description',
    defaultMessage: 'Small text displayed above the main title.',
  },
  title: {
    id: 'Title',
    defaultMessage: 'Title',
  },
  titleDescription: {
    id: 'Hero title description',
    defaultMessage: 'Main highlighted title.',
  },
  description: {
    id: 'Description',
    defaultMessage: 'Description',
  },
  descriptionDescription: {
    id: 'Hero description description',
    defaultMessage: 'Explanatory text or summary displayed below the title.',
  },
  footerText: {
    id: 'Footer text',
    defaultMessage: 'Footer text',
  },
  footerTextDescription: {
    id: 'Footer text description',
    defaultMessage:
      'Additional information displayed at the foot of the block.',
  },
  showDate: {
    id: 'Show date',
    defaultMessage: 'Show date',
  },
  tags: {
    id: 'Tags',
    defaultMessage: 'Tags',
  },
  image: {
    id: 'Image',
    defaultMessage: 'Image',
  },
  hideImage: {
    id: 'Hide image',
    defaultMessage: 'Hide image',
  },
  imageFit: {
    id: 'Image fit',
    defaultMessage: 'Image fit',
  },
  imageFitCover: {
    id: 'Cover',
    defaultMessage: 'Cover',
  },
  imageFitContain: {
    id: 'Contain',
    defaultMessage: 'Contain',
  },
  imageFitDescription: {
    id: 'Image fit description',
    defaultMessage:
      '"Cover" fills the whole available space, cropping the edges of the image if needed. "Contain" fits the entire image inside the space, which may leave empty bands at the sides.',
  },
  cta: {
    id: 'Call to Action',
    defaultMessage: 'Call to Action',
  },
  button: {
    id: 'Show button',
    defaultMessage: 'Show button',
  },
  buttonLink: {
    id: 'Button link',
    defaultMessage: 'Button link',
  },
  buttonText: {
    id: 'Button text',
    defaultMessage: 'Button text',
  },
  buttonTextDescription: {
    id: 'Button text description',
    defaultMessage: 'The text shown inside the button (e.g. "Read more").',
  },
  layout: {
    id: 'Layout',
    defaultMessage: 'Layout',
  },
  fullWidth: {
    id: 'Full width',
    defaultMessage: 'Full width',
  },
  fullWidthDescription: {
    id: 'Full width description',
    defaultMessage:
      'Let the text span the whole block when there is no image to show.',
  },
  blockWidth: {
    id: 'Block Width',
    defaultMessage: 'Block Width',
  },
  imageSize: {
    id: 'Image size / empty space',
    defaultMessage: 'Image size / empty space',
  },
  imageSizeDescription: {
    id: 'Image size description',
    defaultMessage:
      'Controls the width reserved for the image (even when there is none), which in turn sets the space for the text.',
  },
  imageSizeNone: {
    id: 'Image size none',
    defaultMessage: '0% (text full width)',
  },
  imageSizeHalf: {
    id: 'Image size half',
    defaultMessage: '50% (half)',
  },
  titleTag: {
    id: 'Title element',
    defaultMessage: 'Title element',
  },
  titleTagParagraph: {
    id: 'Paragraph (P)',
    defaultMessage: 'Paragraph (P)',
  },
  titleTagDescription: {
    id: 'Title element description',
    defaultMessage:
      'H1 is the main page title, H2 the secondary title and H3 the tertiary one. P renders the title as a paragraph.',
  },
  textSide: {
    id: 'Text side',
    defaultMessage: 'Text side',
  },
  highlightItem: {
    id: 'Highlighted item',
    defaultMessage: 'Highlighted item',
  },
  hrefDescription: {
    id: 'Highlighted item description',
    defaultMessage:
      'Select a content item to pull its data automatically (title, description, image)',
  },
  fileType: {
    id: 'File type',
    defaultMessage: 'File type',
  },
  fileTypeDescription: {
    id: 'File type description',
    defaultMessage: 'E.g. PDF, Report, Article',
  },
});

interface HeroSchemaProps {
  intl: IntlShape;
  formData?: Record<string, any>;
  data?: Record<string, any>;
  [key: string]: any;
}

const layoutFields = [
  'blockWidth',
  'textSide',
  'imageSize',
  'fullWidth',
  'titleTag',
];

export function HeroBlockSchema(props: HeroSchemaProps): any {
  const { intl } = props;
  const formData = props.formData ?? props.data ?? {};
  const variation = formData.variation || 'flex';

  const defaultFields = ['href', 'overwrite'];
  if (formData.overwrite) {
    defaultFields.push(
      'headerText',
      'showDate',
      'title',
      'description',
      'footerText',
    );
  } else {
    defaultFields.push('headerText', 'showDate', 'footerText');
  }

  if (variation === 'flex') {
    defaultFields.push('tags');
  }
  if (variation === 'card') {
    defaultFields.unshift('fileType');
  }

  const schema: any = {
    title: intl.formatMessage(messages.heroBlock),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.content),
        fields: defaultFields,
      },
      {
        id: 'image',
        title: intl.formatMessage(messages.image),
        fields: formData.overwrite
          ? ['preview_image', 'hideImage', 'imageFit']
          : ['hideImage', 'imageFit'],
      },
      {
        id: 'cta',
        title: intl.formatMessage(messages.cta),
        fields: ['button', 'buttonLink', 'buttonText'],
      },
      {
        id: 'layout',
        title: intl.formatMessage(messages.layout),
        fields: layoutFields,
      },
    ],
    properties: {
      overwrite: {
        title: intl.formatMessage(messages.overwrite),
        description: intl.formatMessage(messages.overwriteDescription),
        type: 'boolean',
        default: false,
      },
      headerText: {
        title: intl.formatMessage(messages.headerText),
        description: intl.formatMessage(messages.headerTextDescription),
        type: 'string',
      },
      showDate: {
        title: intl.formatMessage(messages.showDate),
        type: 'boolean',
        default: true,
      },
      title: {
        title: intl.formatMessage(messages.title),
        description: intl.formatMessage(messages.titleDescription),
        type: 'string',
      },
      description: {
        title: intl.formatMessage(messages.description),
        description: intl.formatMessage(messages.descriptionDescription),
        type: 'string',
        widget: 'textarea',
      },
      footerText: {
        title: intl.formatMessage(messages.footerText),
        description: intl.formatMessage(messages.footerTextDescription),
        type: 'string',
      },
      tags: {
        title: intl.formatMessage(messages.tags),
        type: 'array',
        items: {
          type: 'string',
        },
      },
      fileType: {
        title: intl.formatMessage(messages.fileType),
        type: 'string',
        description: intl.formatMessage(messages.fileTypeDescription),
      },
      preview_image: {
        title: intl.formatMessage(messages.image),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: true,
        selectedItemAttrs: ['image_field', 'image_scales'],
      },
      hideImage: {
        title: intl.formatMessage(messages.hideImage),
        type: 'boolean',
        default: false,
      },
      imageFit: {
        title: intl.formatMessage(messages.imageFit),
        type: 'string',
        choices: [
          ['cover', intl.formatMessage(messages.imageFitCover)],
          ['contain', intl.formatMessage(messages.imageFitContain)],
        ],
        default: 'cover',
        description: intl.formatMessage(messages.imageFitDescription),
      },
      button: {
        title: intl.formatMessage(messages.button),
        type: 'boolean',
      },
      buttonLink: {
        title: intl.formatMessage(messages.buttonLink),
        widget: 'object_browser',
        allowExternals: true,
        mode: 'link',
      },
      buttonText: {
        title: intl.formatMessage(messages.buttonText),
        description: intl.formatMessage(messages.buttonTextDescription),
        type: 'string',
      },
      fullWidth: {
        title: intl.formatMessage(messages.fullWidth),
        description: intl.formatMessage(messages.fullWidthDescription),
        type: 'boolean',
        default: false,
      },
      blockWidth: {
        title: intl.formatMessage(messages.blockWidth),
        widget: 'blockWidth',
        default: 'layout',
      },
      imageSize: {
        title: intl.formatMessage(messages.imageSize),
        description: intl.formatMessage(messages.imageSizeDescription),
        type: 'string',
        choices: [
          ['0%', intl.formatMessage(messages.imageSizeNone)],
          ['30%', '30%'],
          ['40%', '40%'],
          ['50%', intl.formatMessage(messages.imageSizeHalf)],
          ['60%', '60%'],
          ['70%', '70%'],
        ],
        default: '50%',
      },
      titleTag: {
        title: intl.formatMessage(messages.titleTag),
        type: 'string',
        choices: [
          ['h1', 'H1'],
          ['h2', 'H2'],
          ['h3', 'H3'],
          ['p', intl.formatMessage(messages.titleTagParagraph)],
        ],
        default: 'h2',
        description: intl.formatMessage(messages.titleTagDescription),
      },
      textSide: {
        title: intl.formatMessage(messages.textSide),
        widget: 'align',
        actions: ['left', 'right'],
        default: 'left',
      },
      href: {
        title: intl.formatMessage(messages.highlightItem),
        description: intl.formatMessage(messages.hrefDescription),
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: [
          'Title',
          'Description',
          'hasPreviewImage',
          'head_title',
          'image_field',
          'image_scales',
          '@type',
          'EffectiveDate',
          'CreationDate',
          'effective',
          'start',
          'end',
        ],
        allowExternals: false,
      },
    },
    required: ['href'],
  };

  // Apply the default styling schema (theme color picker)
  const enhancedSchema = defaultStylingSchema({ schema, formData, intl });

  return enhancedSchema;
}
