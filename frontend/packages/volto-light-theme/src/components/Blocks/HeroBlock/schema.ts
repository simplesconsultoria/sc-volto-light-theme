import { defineMessages } from 'react-intl';
import type { IntlShape } from '@plone/types/src/i18n';
import { defaultStylingSchema } from '../schema';

const messages = defineMessages({
  heroBlock: {
    id: 'heroBlock',
    defaultMessage: 'Hero Block',
  },
  headerText: {
    id: 'heroHeaderText',
    defaultMessage: 'Texto do cabeçalho',
  },
  title: {
    id: 'Title',
    defaultMessage: 'Título',
  },
  description: {
    id: 'Description',
    defaultMessage: 'Descrição',
  },
  footerText: {
    id: 'heroFooterText',
    defaultMessage: 'Texto do rodapé',
  },
  showDate: {
    id: 'heroShowDate',
    defaultMessage: 'Mostrar data',
  },
  tags: {
    id: 'heroTags',
    defaultMessage: 'Tags',
  },
  image: {
    id: 'Image',
    defaultMessage: 'Imagem',
  },
  imageFieldset: {
    id: 'heroImageFieldset',
    defaultMessage: 'Imagem',
  },
  cta: {
    id: 'heroCTA',
    defaultMessage: 'Call to Action',
  },
  button: {
    id: 'Button',
    defaultMessage: 'Mostrar botão',
  },
  buttonLink: {
    id: 'buttonLink',
    defaultMessage: 'Link do botão',
  },
  buttonText: {
    id: 'buttonText',
    defaultMessage: 'Texto do botão',
  },
  layout: {
    id: 'heroLayout',
    defaultMessage: 'Layout',
  },
  fullWidth: {
    id: 'heroFullWidth',
    defaultMessage: 'Largura total',
  },
  textSide: {
    id: 'heroTextSide',
    defaultMessage: 'Lado do texto',
  },
  textSideLeft: {
    id: 'heroTextSideLeft',
    defaultMessage: 'Esquerda',
  },
  textSideRight: {
    id: 'heroTextSideRight',
    defaultMessage: 'Direita',
  },
  highlightItem: {
    id: 'heroHighlightItem',
    defaultMessage: 'Item de Destaque',
  },
  href: {
    id: 'heroHref',
    defaultMessage: 'Item de destaque',
  },
  hrefDescription: {
    id: 'heroHrefDescription',
    defaultMessage:
      'Selecione um conteúdo para puxar dados automaticamente (título, descrição, imagem)',
  },
  fileType: {
    id: 'heroFileType',
    defaultMessage: 'Tipo do arquivo',
  },
  styling: {
    id: 'Styling',
    defaultMessage: 'Estilo',
  },
});

interface HeroSchemaProps {
  intl: IntlShape;
  formData?: Record<string, any>;
  data?: Record<string, any>;
  [key: string]: any;
}

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

  const layoutFields = ['blockWidth', 'textSide', 'imageSize', 'titleTag'];

  const schema: any = {
    title: intl.formatMessage(messages.heroBlock),
    fieldsets: [
      {
        id: 'default',
        title: 'Conteúdo',
        fields: defaultFields,
      },
      {
        id: 'image',
        title: intl.formatMessage(messages.imageFieldset),
        fields: formData.overwrite
          ? ['preview_image', 'imageFit']
          : ['imageFit'],
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
        title: 'Sobrescrever conteúdo',
        description:
          'Marque para customizar o título, descrição e imagem ao invés de puxar automaticamente do item de destaque',
        type: 'boolean',
        default: false,
      },
      headerText: {
        title: intl.formatMessage(messages.headerText),
        description: 'Texto pequeno exibido acima do título principal.',
        type: 'string',
      },
      showDate: {
        title: intl.formatMessage(messages.showDate),
        type: 'boolean',
        default: true,
      },
      title: {
        title: intl.formatMessage(messages.title),
        description: 'Título principal em destaque.',
        type: 'string',
      },
      description: {
        title: intl.formatMessage(messages.description),
        description: 'Texto explicativo ou resumo exibido abaixo do título.',
        type: 'string',
        widget: 'textarea',
      },
      footerText: {
        title: intl.formatMessage(messages.footerText),
        description: 'Informação adicional exibida no rodapé do bloco.',
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
        description: 'Ex: PDF, Relatório, Artigo',
      },
      preview_image: {
        title: intl.formatMessage(messages.image),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: true,
        selectedItemAttrs: ['image_field', 'image_scales'],
      },
      imageFit: {
        title: 'Ajuste da Imagem',
        type: 'string',
        choices: [
          ['cover', 'Preencher (Cover)'],
          ['contain', 'Conter (Contain)'],
        ],
        default: 'cover',
        description:
          'O "Cover" preenche todo o espaço disponível, cortando as bordas da imagem se necessário. O "Contain" ajusta a imagem inteira dentro do espaço, podendo deixar faixas laterais vazias.',
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
        description:
          'O texto que aparecerá dentro do botão (ex: "Saiba mais").',
        type: 'string',
      },
      fullWidth: {
        title: intl.formatMessage(messages.fullWidth),
        type: 'boolean',
        default: false,
      },
      blockWidth: {
        title: 'Largura do Bloco',
        widget: 'blockWidth',
        default: 'layout',
      },
      imageSize: {
        title: 'Tamanho da Imagem / Espaço Vazio',
        description:
          'Controla a largura reservada para a imagem (mesmo se não houver uma), definindo o espaço do texto.',
        type: 'string',
        choices: [
          ['0%', '0% (Texto 100%)'],
          ['30%', '30%'],
          ['40%', '40%'],
          ['50%', '50% (Metade)'],
          ['60%', '60%'],
          ['70%', '70%'],
        ],
        default: '50%',
      },
      titleTag: {
        title: 'Elemento do Título',
        type: 'string',
        choices: [
          ['h1', 'H1'],
          ['h2', 'H2'],
          ['h3', 'H3'],
          ['p', 'Parágrafo (P)'],
        ],
        default: 'h2',
        description:
          'O H1 é o título principal da página. O H2 é o título secundário. O H3 é o título terciário. O P é o parágrafo.',
      },
      textSide: {
        title: intl.formatMessage(messages.textSide),
        widget: 'align',
        actions: ['left', 'right'],
        default: 'left',
      },
      href: {
        title: intl.formatMessage(messages.href),
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
