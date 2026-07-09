import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
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
  [key: string]: any;
}

const DocumentByLineBlockDataForm: React.FC<DocumentByLineBlockDataProps> = (
  props,
) => {
  const { data, block, onChangeBlock } = props;
  const intl = useIntl();
  const schema = DocumentByLineSchema({ ...props, intl });

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
      formData={data}
      block={block}
    />
  );
};

export default DocumentByLineBlockDataForm;
