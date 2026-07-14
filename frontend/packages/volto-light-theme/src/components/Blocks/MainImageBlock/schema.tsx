import React from 'react';
import { defineMessages } from 'react-intl';
import type { BlockSchemaProps } from '@plone/types';
import config from '@plone/volto/registry';
import { defaultStylingSchema } from '../schema';

const messages = defineMessages({
  mainImageBlock: {
    id: 'Main Image Block',
    defaultMessage: 'Bloco de Imagem Principal',
  },
  title: {
    id: 'Title',
    defaultMessage: 'Título',
  },
  description: {
    id: 'Description',
    defaultMessage: 'Descrição',
  },
  altText: {
    id: 'Alt Text',
    defaultMessage: 'Descrição Alternativa',
  },
  AltTextHint: {
    id: 'Alt text hint',
    defaultMessage: 'Deixe em branco se a imagem for puramente decorativa',
  },
  AltTextHintLinkText: {
    id: 'Alt text hint link text',
    defaultMessage: 'Descreva o propósito da imagem',
  },
  openLinkInNewTab: {
    id: 'Open in a new tab',
    defaultMessage: 'Abrir em uma nova aba',
  },
  align: {
    id: 'Alignment',
    defaultMessage: 'Alinhamento',
  },
  size: {
    id: 'Image size',
    defaultMessage: 'Tamanho',
  },
  blockWidth: {
    id: 'Block Width',
    defaultMessage: 'Largura do bloco',
  },
  styling: {
    id: 'Styling',
    defaultMessage: 'Estilo',
  },
  linkSettings: {
    id: 'Link settings',
    defaultMessage: 'Link settings',
  },
  linkTo: {
    id: 'Link to',
    defaultMessage: 'Link to',
  },
});

export const MainImageSchema = (props: BlockSchemaProps): any => {
  const { intl } = props;
  const formData = (props as any).formData ?? (props as any).data ?? props;

  const description: React.ReactNode = (
    <>
      <a
        href="https://www.w3.org/WAI/tutorials/images/decision-tree/"
        title={intl.formatMessage(messages.openLinkInNewTab)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {intl.formatMessage(messages.AltTextHintLinkText)}
      </a>{' '}
      {intl.formatMessage(messages.AltTextHint)}
    </>
  );

  const schema: any = {
    title: intl.formatMessage(messages.mainImageBlock),
    fieldsets: [
      {
        id: 'default',
        title: 'default',
        fields: ['title', 'description', 'altText', 'align', 'size'],
      },
    ],
    properties: {
      title: {
        title: intl.formatMessage(messages.title),
        type: 'string',
      },
      description: {
        title: intl.formatMessage(messages.description),
        type: 'string',
        widget: 'textarea',
      },
      altText: {
        title: intl.formatMessage(messages.altText),
        type: 'string',
        description: description,
      },
      align: {
        title: intl.formatMessage(messages.align),
        widget: 'align',
        default: 'center',
      },
      size: {
        title: intl.formatMessage(messages.size),
        widget: 'image_size',
        default: 'm',
      },
    },
    required: [],
  };

  const enhancedSchema = defaultStylingSchema({ schema, formData, intl });

  if (enhancedSchema.properties.align) {
    enhancedSchema.properties.align.default = 'center';
    enhancedSchema.properties.align.actions = ['left', 'right', 'center'];
  }

  if (enhancedSchema.properties.size) {
    enhancedSchema.properties.size.default = 'l';
    enhancedSchema.properties.size.disabled = formData.align === 'center';
  }

  const stylesSchema = (enhancedSchema.properties.styles as any)?.schema;
  if (stylesSchema) {
    stylesSchema.fieldsets = stylesSchema.fieldsets || [];
    if (!stylesSchema.fieldsets.length) {
      stylesSchema.fieldsets.push({
        id: 'default',
        title: 'default',
        fields: [],
      });
    }

    stylesSchema.fieldsets[0].fields = [
      'blockWidth:noprefix',
      ...stylesSchema.fieldsets[0].fields.filter(
        (field: string) => field !== 'blockWidth:noprefix',
      ),
    ];

    stylesSchema.properties = stylesSchema.properties || {};
    stylesSchema.properties['blockWidth:noprefix'] = {
      widget: 'blockWidth',
      title: intl.formatMessage(messages.blockWidth),
      default: 'default',
      filterActions: ['narrow', 'default', 'layout', 'full'],
      actions: config.blocks.widths || [],
      disabled: formData.align === 'left' || formData.align === 'right',
    };
  }

  if (!enhancedSchema.fieldsets.some((fieldset) => fieldset.id === 'styling')) {
    enhancedSchema.fieldsets.push({
      id: 'styling',
      title: intl.formatMessage(messages.styling),
      fields: ['styles'],
    });
  }

  if (!enhancedSchema.properties.styles) {
    enhancedSchema.properties.styles = {
      widget: 'object',
      title: intl.formatMessage(messages.styling),
      schema: {
        fieldsets: [
          {
            id: 'default',
            title: 'default',
            fields: [],
          },
        ],
        properties: {},
        required: [],
      },
    };
  }

  // Add Link settings fieldset similar to Volto Image block
  if (
    !enhancedSchema.fieldsets.some(
      (fieldset) => fieldset.id === 'link_settings',
    )
  ) {
    enhancedSchema.fieldsets.push({
      id: 'link_settings',
      title: intl.formatMessage(messages.linkSettings),
      fields: ['href', 'openLinkInNewTab'],
    });
  }

  enhancedSchema.properties = enhancedSchema.properties || {};
  if (!enhancedSchema.properties.href) {
    enhancedSchema.properties.href = {
      title: intl.formatMessage(messages.linkTo),
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description', 'hasPreviewImage'],
      allowExternals: true,
    } as any;
  }

  if (!enhancedSchema.properties.openLinkInNewTab) {
    enhancedSchema.properties.openLinkInNewTab = {
      title: intl.formatMessage(messages.openLinkInNewTab),
      type: 'boolean',
    } as any;
  }

  return enhancedSchema;
};
