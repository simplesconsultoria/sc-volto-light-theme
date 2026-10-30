import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import config from '@plone/volto/registry';
import { useIntl } from 'react-intl';
import { EventMetadataSchema } from './schema';

interface EventMetadataDataProps {
  data: Record<string, any>;
  block: string;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  blocksConfig?: Record<string, any>;
  navRoot?: any;
  contentType?: string;
  blocksErrors?: Record<string, any>;
  [key: string]: any;
}

const EventMetadataDataForm: React.FC<EventMetadataDataProps> = (props) => {
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
    blocksConfig?.[data?.['@type']]?.blockSchema ?? EventMetadataSchema;
  const schema =
    typeof blockSchema === 'function'
      ? blockSchema({ ...props, intl, formData: data })
      : blockSchema;

  return (
    <BlockDataForm
      schema={schema}
      title={schema.title}
      onChangeField={(id: string, value: any) => {
        onChangeBlock(block, {
          ...data,
          [id]: value,
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

export default EventMetadataDataForm;
