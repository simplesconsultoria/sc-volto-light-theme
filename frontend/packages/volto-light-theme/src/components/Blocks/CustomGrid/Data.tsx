import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import config from '@plone/volto/registry';
import { useIntl } from 'react-intl';
import { CustomGridSchema } from './Schema';

interface CustomGridDataProps {
  data: Record<string, any>;
  block: string;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  onChangeField: (id: string, value: any) => void;
  blocksConfig?: Record<string, any>;
  navRoot?: any;
  contentType?: string;
  blocksErrors?: Record<string, any>;
  [key: string]: any;
}

/** Sidebar form for the grid settings (layout and width) of a Custom Grid. */
const CustomGridDataForm: React.FC<CustomGridDataProps> = (props) => {
  const {
    data,
    block,
    onChangeBlock,
    onChangeField,
    blocksConfig = config.blocks?.blocksConfig,
    navRoot,
    contentType,
    blocksErrors,
  } = props;
  const intl = useIntl();
  const blockSchema =
    blocksConfig?.[data?.['@type']]?.blockSchema ?? CustomGridSchema;
  const schema =
    typeof blockSchema === 'function'
      ? blockSchema({ ...props, intl, formData: data })
      : blockSchema;

  return (
    <BlockDataForm
      schema={schema}
      title={schema.title || 'Custom Grid'}
      onChangeField={onChangeField}
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

export default CustomGridDataForm;
