import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import config from '@plone/volto/registry';
import { useIntl } from 'react-intl';
import { DocumentByLineSchema } from './schema';

export interface DocumentByLineBlockData {
  showPublished?: boolean;
  showModified?: boolean;
  showAuthor?: boolean;
}

interface DocumentByLineBlockDataProps {
  data: DocumentByLineBlockData;
  block: string;
  onChangeBlock: (id: string, data: DocumentByLineBlockData) => void;
  blocksConfig?: Record<string, any>;
  navRoot?: any;
  contentType?: string;
  blocksErrors?: Record<string, any>;
  [key: string]: any;
}

const DocumentByLineBlockDataForm: React.FC<DocumentByLineBlockDataProps> = (
  props,
) => {
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
    blocksConfig?.[data['@type']]?.blockSchema ?? DocumentByLineSchema;
  const schema =
    typeof blockSchema === 'function'
      ? blockSchema({ ...props, intl, formData: data })
      : blockSchema;

  const handleFieldChange = (id: string, value: any) => {
    onChangeBlock(block, {
      ...data,
      [id]: value,
    });
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

export default DocumentByLineBlockDataForm;
