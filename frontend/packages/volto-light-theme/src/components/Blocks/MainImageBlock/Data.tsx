import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import { useIntl } from 'react-intl';
import { MainImageSchema } from './schema';
import type { MainImageBlockData } from './index';

interface MainImageBlockDataProps {
  data: MainImageBlockData;
  block: string;
  onChangeBlock: (id: string, data: MainImageBlockData) => void;
  [key: string]: any;
}

const sizeMap = {
  l: 'large',
  m: 'medium',
  s: 'small',
} as const;

const MainImageBlockDataForm: React.FC<MainImageBlockDataProps> = (props) => {
  const { data, block, onChangeBlock } = props;
  const intl = useIntl();
  const schema = MainImageSchema({ ...props, intl } as any);

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
      formData={data}
      block={block}
    />
  );
};

export default MainImageBlockDataForm;
