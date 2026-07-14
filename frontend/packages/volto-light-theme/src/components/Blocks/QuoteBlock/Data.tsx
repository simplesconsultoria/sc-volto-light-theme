import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import { useIntl } from 'react-intl';
import { QuoteBlockSchema } from './schema';

interface QuoteBlockDataProps {
  data: Record<string, any>;
  block: string;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  [key: string]: any;
}

const QuoteBlockDataForm: React.FC<QuoteBlockDataProps> = (props) => {
  const { data, block, onChangeBlock } = props;
  const intl = useIntl();
  const schema = QuoteBlockSchema({ ...props, intl, formData: data });

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
    />
  );
};

export default QuoteBlockDataForm;
