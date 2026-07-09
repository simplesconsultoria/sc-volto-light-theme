import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { HeroBlockSchema } from './schema';
import { HeroBlockDataAdapter } from './adapter';

interface HeroBlockDataProps {
  data: Record<string, any>;
  block: string;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  blocksConfig?: Record<string, any>;
  [key: string]: any;
}

const HeroBlockDataForm: React.FC<HeroBlockDataProps> = (props) => {
  const { data, block, onChangeBlock, blocksConfig } = props;
  const intl = useIntl();
  const schema = HeroBlockSchema({ ...props, intl, formData: data });

  const dataAdapter =
    (blocksConfig as any)?.heroBlock?.dataAdapter || HeroBlockDataAdapter;

  const request = useSelector(
    (state: any) => state.content?.subrequests?.[block],
  );
  const content = request?.data;

  return (
    <BlockDataForm
      schema={schema}
      title={schema.title}
      onChangeField={(id: string, value: any, item?: any) => {
        dataAdapter({
          block,
          data,
          id,
          onChangeBlock,
          value,
          content,
          item,
        });
      }}
      formData={data}
      block={block}
      onChangeBlock={onChangeBlock}
      blocksConfig={blocksConfig}
    />
  );
};

export default HeroBlockDataForm;
