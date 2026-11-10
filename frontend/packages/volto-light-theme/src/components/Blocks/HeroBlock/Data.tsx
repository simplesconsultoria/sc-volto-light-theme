import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import config from '@plone/volto/registry';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { HeroBlockSchema } from './schema';
import { heroBlockDataAdapter } from './adapter';

interface HeroBlockDataProps {
  data: Record<string, any>;
  block: string;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  blocksConfig?: Record<string, any>;
  navRoot?: any;
  contentType?: string;
  blocksErrors?: Record<string, any>;
  [key: string]: any;
}

const HeroBlockDataForm: React.FC<HeroBlockDataProps> = (props) => {
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
    blocksConfig?.[data['@type']]?.blockSchema ?? HeroBlockSchema;
  const schema =
    typeof blockSchema === 'function'
      ? blockSchema({ ...props, intl, formData: data })
      : blockSchema;

  const dataAdapter =
    (blocksConfig as any)?.heroBlock?.dataAdapter || heroBlockDataAdapter;

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
      navRoot={navRoot}
      contentType={contentType}
      errors={blocksErrors}
    />
  );
};

export default HeroBlockDataForm;
