import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import config from '@plone/volto/registry';
import { useIntl } from 'react-intl';
import { MainImageSchema } from './schema';
import type { MainImageBlockData } from './index';

interface MainImageBlockDataProps {
  data: MainImageBlockData;
  block: string;
  onChangeBlock: (id: string, data: MainImageBlockData) => void;
  blocksConfig?: Record<string, any>;
  navRoot?: any;
  contentType?: string;
  blocksErrors?: Record<string, any>;
  [key: string]: any;
}

const sizeMap = {
  l: 'large',
  m: 'medium',
  s: 'small',
} as const;

const MainImageBlockDataForm: React.FC<MainImageBlockDataProps> = (props) => {
  const {
    data,
    block,
    onChangeBlock,
    blocksConfig = config.blocks?.blocksConfig,
    navRoot,
    contentType,
    blocksErrors,
  } = props;
  const intl = useIntl();
  const blockSchema =
    blocksConfig?.[data['@type']]?.blockSchema ?? MainImageSchema;
  const schema =
    typeof blockSchema === 'function'
      ? blockSchema({ ...props, intl, formData: data } as any)
      : blockSchema;

  const handleFieldChange = (id: string, value: any) => {
    const nextData: MainImageBlockData & { styles?: Record<string, any> } = {
      ...data,
      [id]: value,
    };

    let nextStyles = data.styles ? { ...data.styles } : undefined;

    if (id === 'styles' && value && typeof value === 'object') {
      nextStyles = {
        ...(nextStyles || {}),
        ...value,
      };
    }

    if (id === 'size') {
      nextStyles = {
        ...(nextStyles || {}),
        'size:noprefix': sizeMap[value as keyof typeof sizeMap],
      };
    }

    if (id === 'align' && !(value === 'left' || value === 'right')) {
      if (data.size !== 'l') {
        nextData.size = 'l';
        nextStyles = {
          ...(nextStyles || {}),
          'size:noprefix': sizeMap.l,
        };
      }
    }

    if (id === 'blockWidth:noprefix' && value) {
      nextStyles = {
        ...(nextStyles || {}),
        'blockWidth:noprefix': value,
      };
    }

    if (nextStyles) {
      nextData.styles = nextStyles;
    }

    onChangeBlock(block, nextData);
  };

  return (
    <BlockDataForm
      schema={schema}
      title={schema.title}
      onChangeField={handleFieldChange}
      onChangeBlock={onChangeBlock}
      formData={data}
      block={block}
      blocksConfig={blocksConfig}
      navRoot={navRoot}
      contentType={contentType}
      errors={blocksErrors}
    />
  );
};

export default MainImageBlockDataForm;
